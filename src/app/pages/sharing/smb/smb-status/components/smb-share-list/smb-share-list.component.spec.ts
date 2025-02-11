import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { Spectator } from '@ngneat/spectator';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { mockWebSocket, mockCall } from 'app/core/testing/utils/mock-websocket.utils';
import { SmbShareInfo } from 'app/interfaces/smb-status.interface';
import { AppCommonModule } from 'app/modules/common/app-common.module';
import { EntityModule } from 'app/modules/entity/entity.module';
import { IxTable2Harness } from 'app/modules/ix-table2/components/ix-table2/ix-table2.harness';
import { IxTable2Module } from 'app/modules/ix-table2/ix-table2.module';
import { AppLoaderModule } from 'app/modules/loader/app-loader.module';
import { SmbShareListComponent } from './smb-share-list.component';

describe('SmbShareListComponent', () => {
  let spectator: Spectator<SmbShareListComponent>;
  let loader: HarnessLoader;
  let table: IxTable2Harness;

  const shares = [
    {
      service: 'turtles',
      server_id: {
        pid: '2102401',
        task_id: '0',
        vnn: '4294967295',
        unique_id: '4458796888113407749',
      },
      tcon_id: '1586296247',
      session_id: '1368450234',
      machine: '10.234.16.211',
      connected_at: '2023-10-26T12:17:17.457352+02:00',
      encryption: { cipher: '-', degree: 'none' },
      signing: { cipher: '-', degree: 'none' },
    },
  ] as SmbShareInfo[];

  const createComponent = createComponentFactory({
    component: SmbShareListComponent,
    imports: [AppLoaderModule, EntityModule, IxTable2Module, AppCommonModule],
    providers: [mockWebSocket([mockCall('smb.status', shares)])],
  });

  beforeEach(async () => {
    spectator = createComponent();
    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
    table = await loader.getHarness(IxTable2Harness);
  });

  it('should show table rows', async () => {
    const expectedRows = [
      ['Service', 'Session ID', 'Machine', 'Connected at', 'Encryption', 'Signing'],
      ['turtles', '1368450234', '10.234.16.211', '2023-10-26T12:17:17.457352+02:00', '-', '-'],
    ];

    const cells = await table.getCellTexts();
    expect(cells).toEqual(expectedRows);
  });

  it('should call loadData when Refresh button is pressed', async () => {
    jest.spyOn(spectator.component.dataProvider, 'load');
    const refreshButton = await loader.getHarness(MatButtonHarness.with({ text: 'Refresh' }));
    await refreshButton.click();
    expect(spectator.component.dataProvider.load).toHaveBeenCalled();
  });
});
