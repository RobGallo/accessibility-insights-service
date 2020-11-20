// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { System } from 'common';
import { inject, injectable, optional } from 'inversify';
import { GlobalLogger } from 'logger';
import * as Puppeteer from 'puppeteer';
import axe from 'axe-core';
import { AxeScanResults } from './axe-scan-results';
import { AxePuppeteerFactory } from './factories/axe-puppeteer-factory';
import { WebDriver } from './web-driver';
import { PageNavigator } from './page-navigator';

@injectable()
export class Page {
    public page: Puppeteer.Page;
    public browser: Puppeteer.Browser;
    public get userAgent(): string {
        return this.pageNavigator.pageConfigurator.getUserAgent();
    }

    constructor(
        @inject(WebDriver) private readonly webDriver: WebDriver,
        @inject(AxePuppeteerFactory) private readonly axePuppeteerFactory: AxePuppeteerFactory,
        @inject(PageNavigator) private readonly pageNavigator: PageNavigator,
        @inject(GlobalLogger) @optional() private readonly logger: GlobalLogger,
    ) {}

    public async create(browserExecutablePath?: string): Promise<void> {
        console.log('page 1');
        this.browser = await this.webDriver.launch(browserExecutablePath);
        console.log('page 2');
        this.page = await this.browser.newPage();
        console.log('page 3');
        this.page.setUserAgent(this.webDriver.userAgent1);
        console.log('page 3.1');
    }

    public async scanForA11yIssues(url: string, contentSourcePath?: string): Promise<AxeScanResults> {
        console.log('page 4');
        let scanResults: AxeScanResults;
        const response = await this.pageNavigator.navigate(url, this.page, async (browserError) => {
            this.logger?.logError('Page navigation error', { browserError: System.serializeError(browserError) });

            scanResults = { error: browserError, pageResponseCode: browserError.statusCode };
        });

        console.log('page 5');

        if (scanResults?.error !== undefined) {
            console.log('page 6');
            return scanResults;
        }

        console.log('page 7');

        return this.scanPageForIssues(response, contentSourcePath);
    }

    public async close(): Promise<void> {
        if (this.webDriver !== undefined) {
            await this.webDriver.close();
        }
    }

    private async scanPageForIssues(response: Puppeteer.Response, contentSourcePath?: string): Promise<AxeScanResults> {
        console.log('page 8');
        const axePuppeteer = await this.axePuppeteerFactory.createAxePuppeteer(this.page, contentSourcePath);
        console.log('page 9');
        let axeResults: axe.AxeResults;
        try {
            console.log('page 10');
            axeResults = await axePuppeteer.analyze();
            console.log('page 11');
        } catch (error) {
            console.log('page 12');
            this.logger?.logError('Axe core engine error', { browserError: System.serializeError(error), url: this.page.url() });

            return { error: `Axe core engine error. ${System.serializeError(error)}`, scannedUrl: this.page.url() };
        }

        console.log('page 13');

        const scanResults: AxeScanResults = {
            results: axeResults,
            pageTitle: await this.page.title(),
            browserSpec: await this.browser.version(),
            pageResponseCode: response.status(),
        };

        console.log('page 14');

        if (response.request().redirectChain().length > 0) {
            console.log('page 15');
            this.logger?.logWarn(`Scanning performed on redirected page`, { redirectedUrl: axeResults.url });
            scanResults.scannedUrl = axeResults.url;
        }

        console.log('page 16');

        return scanResults;
    }
}
