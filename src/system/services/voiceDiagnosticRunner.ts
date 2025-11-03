/**
 * Voice Diagnostic Runner
 * Utility to run voice diagnostics from browser console
 *
 * Usage in browser console:
 * import('/src/system/services/voiceDiagnosticRunner.ts').then(m => m.runVoiceDiagnostics())
 */

import { VoiceConnectionDiagnostics } from './voiceConnectionDiagnostics';
import logger from '../../lib/utils/logger';

/**
 * Run voice diagnostics and display results in console
 */
export async function runVoiceDiagnostics(): Promise<void> {
  console.clear();
  console.log('%c🔬 Voice Connection Diagnostics', 'font-size: 20px; font-weight: bold; color: #4CAF50');
  console.log('Running comprehensive diagnostics...\n');

  try {
    const diagnostics = new VoiceConnectionDiagnostics();
    const results = await diagnostics.runAllTests();

    console.group('📊 Diagnostic Results');

    results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      const style = result.passed
        ? 'color: #4CAF50; font-weight: bold'
        : 'color: #F44336; font-weight: bold';

      console.group(`${icon} Test ${index + 1}: ${result.test}`);
      console.log(`%c${result.message}`, style);

      if (result.details) {
        console.log('Details:', result.details);
      }

      if (!result.passed && result.details?.possibleCauses) {
        console.warn('Possible Causes:', result.details.possibleCauses);
      }

      if (!result.passed && result.details?.solution) {
        console.info('Solution:', result.details.solution);
      }

      console.groupEnd();
    });

    console.groupEnd();

    // Summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log('\n' + '='.repeat(60));
    console.log(`📈 Summary: ${passed}/${total} tests passed`);

    if (failed > 0) {
      console.log(`%c❌ ${failed} test(s) failed`, 'color: #F44336; font-weight: bold; font-size: 16px');
      console.log('\n🔧 Next Steps:');

      const failedTests = results.filter(r => !r.passed);
      failedTests.forEach((test, index) => {
        console.log(`\n${index + 1}. ${test.test}:`);
        console.log(`   Issue: ${test.message}`);

        if (test.details?.solution) {
          console.log(`   Solution: ${test.details.solution}`);
        }

        if (test.details?.possibleCauses) {
          console.log('   Possible causes:');
          test.details.possibleCauses.forEach((cause: string) => {
            console.log(`   - ${cause}`);
          });
        }
      });

      // Special handling for OPENAI_API_KEY issues
      const wsTest = failedTests.find(t => t.test === 'WebSocket Connection');
      if (wsTest?.message?.includes('OPENAI_API_KEY')) {
        console.log('\n' + '⚠️'.repeat(30));
        console.log('%c🔑 OPENAI_API_KEY Configuration Required!', 'font-size: 18px; font-weight: bold; color: #FF9800; background: #FFF3E0; padding: 10px');
        console.log('\n📝 Steps to configure OPENAI_API_KEY:');
        console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to Edge Functions > Settings > Secrets');
        console.log('4. Add a new secret:');
        console.log('   Name: OPENAI_API_KEY');
        console.log('   Value: sk-proj-... (your OpenAI API key)');
        console.log('5. Redeploy the voice-coach-realtime function');
        console.log('\n💡 Get your OpenAI API key from: https://platform.openai.com/api-keys');
        console.log('⚠️'.repeat(30));
      }
    } else {
      console.log('%c✅ All tests passed! Voice connection should work.', 'color: #4CAF50; font-weight: bold; font-size: 16px');
    }

    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Diagnostic runner failed:', error);
    logger.error('VOICE_DIAGNOSTICS', 'Diagnostic runner failed', { error });
  }
}

/**
 * Quick check - runs minimal diagnostics
 */
export async function quickCheck(): Promise<boolean> {
  console.log('🔍 Running quick check...');

  const diagnostics = new VoiceConnectionDiagnostics();
  const results = await diagnostics.runAllTests();

  const allPassed = results.every(r => r.passed);

  if (allPassed) {
    console.log('✅ Quick check passed - voice should work');
  } else {
    console.log('❌ Quick check failed - run full diagnostics for details');
    console.log('Run: runVoiceDiagnostics()');
  }

  return allPassed;
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).runVoiceDiagnostics = runVoiceDiagnostics;
  (window as any).quickVoiceCheck = quickCheck;

  console.log('💡 Voice diagnostic utilities loaded!');
  console.log('Run in console: runVoiceDiagnostics() or quickVoiceCheck()');
}
