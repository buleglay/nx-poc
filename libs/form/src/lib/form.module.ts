import { ModuleWithProviders, NgModule } from '@angular/core';
import { ConfigOption, FORMLY_CONFIG, FormlyConfig, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { ReactiveFormsModule } from '@angular/forms';

export const defaultErrorMessage = [
  { name: 'required', message: (error: any, field: FormlyFieldConfig) => `${field?.templateOptions?.label} is required` },
];

export const defaultConfig: ConfigOption = {
  validationMessages: defaultErrorMessage,
};

const formlyConfigFactory = (config: ConfigOption, defaultConfig: ConfigOption) => () => ({ ...defaultConfig, ...config });

@NgModule({
  imports: [
    ReactiveFormsModule,
    FormlyModule.forChild(),
    FormlyMaterialModule,
  ],
  exports: [
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
  ]
})
export class FormModule {
  static forRoot(config: ConfigOption = {}): ModuleWithProviders<FormModule> {
    return {
      ngModule: FormModule,
      providers: [
        FormlyConfig,
        { provide: FORMLY_CONFIG, useFactory: formlyConfigFactory(config, defaultConfig), multi: true },
      ],
    };
  }

  static forChild(config: ConfigOption = {}): ModuleWithProviders<FormModule> {
    return {
      ngModule: FormModule,
      providers: [
        { provide: FORMLY_CONFIG, useFactory: formlyConfigFactory(config, defaultConfig), multi: true },
      ],
    };
  }
}
