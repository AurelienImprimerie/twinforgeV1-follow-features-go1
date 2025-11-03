/**
 * Voice Connection Diagnostics
 * Utility to diagnose voice connection issues
 */

import logger from '../../lib/utils/logger';
import { environmentDetectionService } from './environmentDetectionService';

export interface DiagnosticResult {
  passed: boolean;
  test: string;
  message: string;
  details?: any;
}

export class VoiceConnectionDiagnostics {
  /**
   * Run all diagnostic tests
   */
  async runAllTests(): Promise<DiagnosticResult[]> {
    logger.info('VOICE_DIAGNOSTICS', '🔬 Starting voice connection diagnostics');

    const results: DiagnosticResult[] = [];

    // Test 1: Environment variables
    const test1 = await this.testEnvironmentVariables();
    results.push(test1);
    this.logTestResult(1, test1);

    // Test 2: WebSocket API availability
    const test2 = await this.testWebSocketAPI();
    results.push(test2);
    this.logTestResult(2, test2);

    // Test 3: Environment capabilities
    const test3 = await this.testEnvironmentCapabilities();
    results.push(test3);
    this.logTestResult(3, test3);

    // Test 4: Supabase edge function reachability (HTTP)
    const test4 = await this.testEdgeFunctionReachability();
    results.push(test4);
    this.logTestResult(4, test4);

    // Test 5: Microphone permissions
    const test5 = await this.testMicrophonePermissions();
    results.push(test5);
    this.logTestResult(5, test5);

    // Test 6: WebSocket connection (if all previous tests passed)
    const allPreviousPassed = results.every(r => r.passed);
    if (allPreviousPassed) {
      const test6 = await this.testWebSocketConnection();
      results.push(test6);
      this.logTestResult(6, test6);
    } else {
      logger.warn('VOICE_DIAGNOSTICS', 'Skipping WebSocket connection test due to previous failures');
    }

    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed).length;

    logger.info('VOICE_DIAGNOSTICS', '✅ Diagnostics complete', {
      totalTests: results.length,
      passed: passedCount,
      failed: failedCount
    });

    // Log all failed tests with full details
    if (failedCount > 0) {
      logger.error('VOICE_DIAGNOSTICS', '❌ Failed tests summary', {
        failedTests: results
          .filter(r => !r.passed)
          .map(r => ({
            test: r.test,
            message: r.message,
            details: r.details
          }))
      });
    }

    return results;
  }

  /**
   * Log individual test result with full details
   */
  private logTestResult(testNumber: number, result: DiagnosticResult): void {
    const icon = result.passed ? '✅' : '❌';
    const level = result.passed ? 'info' : 'error';

    logger[level](
      'VOICE_DIAGNOSTICS',
      `${icon} Test ${testNumber}: ${result.test} - ${result.message}`,
      {
        testNumber,
        testName: result.test,
        passed: result.passed,
        message: result.message,
        details: result.details
      }
    );
  }

  /**
   * Test 1: Environment variables
   */
  private async testEnvironmentVariables(): Promise<DiagnosticResult> {
    logger.info('VOICE_DIAGNOSTICS', 'Test 1: Checking environment variables');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const hasUrl = !!supabaseUrl;
    const hasKey = !!supabaseAnonKey;
    const passed = hasUrl && hasKey;

    const details = {
      VITE_SUPABASE_URL: hasUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
      VITE_SUPABASE_ANON_KEY: hasKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'MISSING',
      allViteVars: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
    };

    return {
      passed,
      test: 'Environment Variables',
      message: passed
        ? 'Supabase configuration found'
        : `Missing environment variables: ${!hasUrl ? 'VITE_SUPABASE_URL ' : ''}${!hasKey ? 'VITE_SUPABASE_ANON_KEY' : ''}`,
      details
    };
  }

  /**
   * Test 2: WebRTC API availability
   */
  private async testWebSocketAPI(): Promise<DiagnosticResult> {
    logger.info('VOICE_DIAGNOSTICS', 'Test 2: Checking WebRTC API availability');

    const hasRTCPeerConnection = typeof RTCPeerConnection !== 'undefined';
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const passed = hasRTCPeerConnection && hasGetUserMedia;

    return {
      passed,
      test: 'WebRTC API',
      message: passed
        ? 'WebRTC API is available'
        : `WebRTC requirements missing: ${!hasRTCPeerConnection ? 'RTCPeerConnection ' : ''}${!hasGetUserMedia ? 'getUserMedia' : ''}`,
      details: {
        hasRTCPeerConnection,
        hasGetUserMedia,
        userAgent: navigator.userAgent
      }
    };
  }

  /**
   * Test 3: Environment capabilities
   */
  private async testEnvironmentCapabilities(): Promise<DiagnosticResult> {
    logger.info('VOICE_DIAGNOSTICS', 'Test 3: Checking environment capabilities');

    const caps = environmentDetectionService.getCapabilities();
    const passed = caps.canUseVoiceMode;

    return {
      passed,
      test: 'Environment Capabilities',
      message: passed
        ? 'Voice mode is supported in this environment'
        : `Voice mode not supported: ${caps.limitations.join(', ')}`,
      details: {
        canUseVoiceMode: caps.canUseVoiceMode,
        canUseWebSocket: caps.canUseWebSocket,
        environmentName: caps.environmentName,
        isStackBlitz: caps.isStackBlitz,
        isWebContainer: caps.isWebContainer,
        limitations: caps.limitations,
        recommendations: caps.recommendations
      }
    };
  }

  /**
   * Test 4: Edge function reachability (HTTP test)
   */
  private async testEdgeFunctionReachability(): Promise<DiagnosticResult> {
    logger.info('VOICE_DIAGNOSTICS', 'Test 4: Testing edge function reachability (HTTP)');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        passed: false,
        test: 'Edge Function Reachability',
        message: 'Cannot test - missing configuration',
        details: { reason: 'Environment variables not set' }
      };
    }

    try {
      // Test health check endpoint first
      const healthUrl = `${supabaseUrl}/functions/v1/voice-coach-realtime/health`;

      logger.info('VOICE_DIAGNOSTICS', 'Making HTTP GET request to health endpoint', {
        url: healthUrl
      });

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      let healthData: any = null;
      let passed = response.ok;

      if (response.ok) {
        try {
          healthData = await response.json();
          logger.info('VOICE_DIAGNOSTICS', 'Health check response received', healthData);

          // Check if OpenAI key is configured
          if (!healthData.hasOpenAIKey) {
            passed = false;
          }
        } catch (jsonError) {
          logger.warn('VOICE_DIAGNOSTICS', 'Could not parse health check response as JSON');
        }
      }

      return {
        passed,
        test: 'Edge Function Reachability',
        message: passed
          ? healthData?.hasOpenAIKey
            ? `Edge function is ready with OpenAI key configured (${healthData.openaiKeyPrefix})`
            : 'Edge function is reachable but OPENAI_API_KEY is NOT configured'
          : `Edge function returned error: HTTP ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          healthData,
          url: healthUrl,
          recommendation: !healthData?.hasOpenAIKey
            ? 'Go to Supabase Dashboard > Edge Functions > voice-coach-realtime > Secrets and add OPENAI_API_KEY'
            : undefined
        }
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      return {
        passed: false,
        test: 'Edge Function Reachability',
        message: `Cannot reach edge function: ${errorMsg}`,
        details: {
          error: errorMsg,
          name: error instanceof Error ? error.name : 'Unknown',
          possibleCauses: [
            'Network connectivity issue',
            'CORS policy blocking request',
            'Edge function not deployed',
            'Firewall or proxy blocking connection'
          ]
        }
      };
    }
  }

  /**
   * Test 5: Microphone permissions
   */
  private async testMicrophonePermissions(): Promise<DiagnosticResult> {
    logger.info('VOICE_DIAGNOSTICS', 'Test 5: Checking microphone permissions');

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          passed: false,
          test: 'Microphone Permissions',
          message: 'getUserMedia API not available',
          details: {
            reason: 'Browser does not support mediaDevices API',
            suggestion: 'Update your browser or use a different browser'
          }
        };
      }

      // Try to get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Clean up immediately
      stream.getTracks().forEach(track => track.stop());

      return {
        passed: true,
        test: 'Microphone Permissions',
        message: 'Microphone access granted',
        details: {
          tracks: stream.getTracks().map(t => ({
            kind: t.kind,
            label: t.label,
            enabled: t.enabled
          }))
        }
      };
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'Unknown';
      const errorMsg = error instanceof Error ? error.message : String(error);

      return {
        passed: false,
        test: 'Microphone Permissions',
        message: `Microphone access denied: ${errorName}`,
        details: {
          error: errorMsg,
          errorName,
          possibleCauses: errorName === 'NotAllowedError'
            ? ['User denied microphone permission', 'Permission prompt dismissed']
            : errorName === 'NotFoundError'
            ? ['No microphone device found']
            : ['Unknown permission error']
        }
      };
    }
  }

  /**
   * Test 6: WebRTC session creation
   */
  private async testWebSocketConnection(): Promise<DiagnosticResult> {
    logger.info('VOICE_DIAGNOSTICS', 'Test 6: Testing WebRTC session creation');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        passed: false,
        test: 'WebRTC Session Creation',
        message: 'Cannot test - missing configuration',
        details: { reason: 'Environment variables not set' }
      };
    }

    return new Promise(async (resolve) => {
      const startTime = Date.now();
      let peerConnection: RTCPeerConnection | null = null;

      try {
        logger.info('VOICE_DIAGNOSTICS', 'Creating RTCPeerConnection for test');

        // Créer une peer connection de test
        peerConnection = new RTCPeerConnection();

        // Ajouter un track audio simulé (silence)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => {
          if (peerConnection) {
            peerConnection.addTrack(track, stream);
          }
        });

        // Créer le data channel
        const dataChannel = peerConnection.createDataChannel('test-channel');

        // Créer l'offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        logger.info('VOICE_DIAGNOSTICS', 'Sending SDP offer to backend');

        // Tester l'endpoint /session
        const sessionUrl = `${supabaseUrl}/functions/v1/voice-coach-realtime/session`;
        const response = await fetch(sessionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey
          },
          body: JSON.stringify({
            sdp: offer.sdp,
            model: 'gpt-4o-realtime-preview-2024-12-17',
            voice: 'alloy'
          })
        });

        // Nettoyer
        stream.getTracks().forEach(track => track.stop());
        dataChannel.close();
        peerConnection.close();

        const duration = Date.now() - startTime;

        if (response.ok) {
          const sdpAnswer = await response.text();

          resolve({
            passed: true,
            test: 'WebRTC Session Creation',
            message: `WebRTC session created successfully (${duration}ms)`,
            details: {
              duration,
              sdpOfferLength: offer.sdp?.length || 0,
              sdpAnswerLength: sdpAnswer.length,
              status: response.status
            }
          });
        } else {
          const errorText = await response.text();

          resolve({
            passed: false,
            test: 'WebRTC Session Creation',
            message: `Session creation failed: HTTP ${response.status}`,
            details: {
              duration,
              status: response.status,
              statusText: response.statusText,
              error: errorText,
              possibleCauses: [
                response.status === 500 ? 'OPENAI_API_KEY not configured in Edge Function' : '',
                response.status === 401 ? 'Supabase authentication failed' : '',
                response.status === 400 ? 'Invalid SDP format' : '',
                'Network or CORS issue'
              ].filter(Boolean),
              solution: response.status === 500
                ? 'Go to Supabase Dashboard > Edge Functions > Secrets and add OPENAI_API_KEY'
                : 'Check backend logs for details'
            }
          });
        }
      } catch (error) {
        const duration = Date.now() - startTime;

        // Nettoyer en cas d'erreur
        if (peerConnection) {
          peerConnection.close();
        }

        resolve({
          passed: false,
          test: 'WebRTC Session Creation',
          message: `WebRTC test failed: ${error instanceof Error ? error.message : String(error)}`,
          details: {
            duration,
            error: error instanceof Error ? error.message : String(error),
            errorName: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack : undefined,
            possibleCauses: [
              'Microphone access denied',
              'RTCPeerConnection not supported',
              'Network connectivity issue',
              'CORS or firewall blocking'
            ]
          }
        });
      }
    });
  }

  /**
   * Print diagnostic results to console
   */
  printResults(results: DiagnosticResult[]): void {
    console.group('🔬 Voice Connection Diagnostics');

    results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.group(`${icon} Test ${index + 1}: ${result.test}`);
      console.log('Status:', result.passed ? 'PASSED' : 'FAILED');
      console.log('Message:', result.message);
      if (result.details) {
        console.log('Details:', result.details);
      }
      console.groupEnd();
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    console.log('\n📊 Summary:', `${passedCount}/${totalCount} tests passed`);

    if (passedCount < totalCount) {
      console.log('\n💡 Next Steps:');
      results.filter(r => !r.passed).forEach(result => {
        console.log(`- Fix: ${result.test}`);
        console.log(`  ${result.message}`);
      });
    }

    console.groupEnd();
  }
}

// Export singleton
export const voiceConnectionDiagnostics = new VoiceConnectionDiagnostics();
