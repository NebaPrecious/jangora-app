import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'jangora-app',
  webDir: 'www',
  plugins: {
    LocalNotifications: {
      // Monochrome status-bar icon - add res/drawable/ic_stat_jangora.png when the android/ project is created.
      smallIcon: 'ic_stat_jangora',
      iconColor: '#40916C',
    },
  },
};

export default config;
