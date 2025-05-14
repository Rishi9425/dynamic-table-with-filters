import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { TableFilterAdvancedDemo} from './app/app.component';

bootstrapApplication(TableFilterAdvancedDemo, appConfig)
  .catch((err) => console.error(err));
