// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ScanRunResultResponse } from 'service-library';
import { TestEnvironment } from '../common-types';
import { test } from '../test-decorator';
import { FunctionalTestGroup } from './functional-test-group';
import { expect } from 'chai';

/* eslint-disable @typescript-eslint/no-unused-expressions */

export class ScanCompletionNotificationTestGroup extends FunctionalTestGroup {
    @test(TestEnvironment.all)
    public async testScanNotification(): Promise<void> {
        const response = await this.a11yServiceClient.getScanStatus(this.testContextData.scanId);
        const notification = (<ScanRunResultResponse>response.body).notification;

        expect(notification.state).to.equal('sent');
    }
}
