import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { InitService } from './services/init.service';
import { ConfigService } from './services/config.service';

function initializeApp(initService: InitService, configService: ConfigService) {
  return () => {
    // S'assurer que la configuration est chargée avant d'initialiser les services
    return new Promise<void>((resolve) => {
      configService.getConfig().subscribe(() => {
        console.log('Configuration chargée avec succès');
        resolve();
      });
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    importProvidersFrom(HttpClientModule),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [InitService, ConfigService],
      multi: true
    }
  ]
};