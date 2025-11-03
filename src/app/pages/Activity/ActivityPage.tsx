import ActivityDailyTab from './Activity/ActivityDailyTab';
import ActivityProgressTab from './Activity/ActivityProgressTab';
import ActivityInsightsTab from './Activity/ActivityInsightsTab';
import ActivityHistoryTab from './Activity/ActivityHistoryTab';
@@ .. @@
        </Tabs.List>
        
        <Tabs.Panel value="daily">
          <ActivityDailyTab />
        </Tabs.Panel>
        
        <Tabs.Panel value="insights">
          <ActivityInsightsTab />
        </Tabs.Panel>
        
        <Tabs.Panel value="progression">
          <ActivityProgressTab />
        </Tabs.Panel>
        
        <Tabs.Panel value="history">
          <ActivityHistoryTab />
        </Tabs.Panel>
          <Tabs.Trigger value="insights" icon="Construction">
            <span className="tab-text">Insights</span>
          </Tabs.Trigger>
          <Tabs.Trigger value="progression" icon="Lightbulb">
            <span className="tab-text">Conseils</span>
          </Tabs.Trigger>