// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { PromiseUtils, ServiceConfiguration, System } from 'common';
import { inject, injectable } from 'inversify';
import { GlobalLogger } from 'logger';
import { AxeScanResults, Page } from 'scanner-global-library';

@injectable()
export class Scanner {
    constructor(
        @inject(Page) private readonly page: Page,
        @inject(GlobalLogger) private readonly logger: GlobalLogger,
        @inject(PromiseUtils) private readonly promiseUtils: PromiseUtils,
        @inject(ServiceConfiguration) private readonly serviceConfig: ServiceConfiguration,
    ) {}

    public async scan(url: string): Promise<AxeScanResults> {
        const scanConfig = await this.serviceConfig.getConfigValue('scanConfig');

        return this.promiseUtils.waitFor(this.scanImpl(url), scanConfig.scanTimeoutInMin * 60000, () =>
            Promise.resolve({
                error: {
                    errorType: 'ScanTimeout',
                    message: `Scan timed out after ${scanConfig.scanTimeoutInMin} minutes`,
                    stack: new Error().stack,
                },
            } as AxeScanResults),
        );
    }

    private async scanImpl(url: string): Promise<AxeScanResults> {
        try {
            console.log('scanner 1');
            this.logger.logInfo(`Starting accessibility website page scanning.`, { url });
            await this.page.create();
            console.log('scanner 2');
            const scanResult = await this.page.scanForA11yIssues(url);
            console.log('scanner 3');
            this.logger.logInfo(`Accessibility scanning of website page successfully completed.`, { url });
            console.log('scanner 4');

            return scanResult;
        } catch (error) {
            this.logger.logError(`An error occurred while scanning website page.`, { url, error: System.serializeError(error) });
            console.log('scanner 5');

            // throw service originated error to indicate a service failure
            throw error;
        } finally {
            try {
                console.log('scanner 6');
                await this.page.close();
                console.log('scanner 7');
            } catch (error) {
                this.logger.logError('An error occurred while closing web browser.', { url, error: System.serializeError(error) });
                console.log('scanner 8');
            }
        }
    }
}
