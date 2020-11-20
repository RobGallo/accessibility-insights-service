// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { inject, injectable, optional } from 'inversify';
import { GlobalLogger, Logger } from 'logger';
import Puppeteer from 'puppeteer';

@injectable()
export class WebDriver {
    public browser: Puppeteer.Browser;
    public userAgent1: string;

    constructor(
        @inject(GlobalLogger) @optional() private readonly logger: Logger,
        private readonly puppeteer: typeof Puppeteer = Puppeteer,
    ) {}

    public async launch(browserExecutablePath?: string): Promise<Puppeteer.Browser> {
        console.log('webdriver 1');
        this.browser = await this.puppeteer.launch({
            executablePath: browserExecutablePath,
            headless: true,
            args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: {
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1,
            },
        });

        console.log('webdriver 2');
        this.userAgent1 = (await this.browser.userAgent()).replace('HeadlessChrome', 'Chrome');
        this.logger?.logInfo('Chromium browser instance started.');
        console.log('webdriver 2.1');

        return this.browser;
    }

    public async close(): Promise<void> {
        console.log('webdriver 3');
        if (this.browser !== undefined) {
            console.log('webdriver 4');
            await this.browser.close();
            console.log('webdriver 5');
            this.logger?.logInfo('Chromium browser instance stopped.');
        }
    }
}
