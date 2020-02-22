import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DataInterface} from '@sports-alliance/sports-lib/lib/data/data.interface';
import {UserUnitSettingsInterface} from '@sports-alliance/sports-lib/lib/users/settings/user.unit.settings.interface';
import {DynamicDataLoader} from '@sports-alliance/sports-lib/lib/data/data.store';

@Component({
  selector: 'app-header-stats',
  templateUrl: './header-stats.component.html',
  styleUrls: ['./header-stats.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderStatsComponent implements OnChanges {
  @Input() statsToShow: string[];
  @Input() stats: DataInterface[] = [];
  @Input() unitSettings?: UserUnitSettingsInterface;

  ngOnChanges(changes: SimpleChanges): void {
    this.stats = this.statsToShow.reduce((accu, statType) => {
      return this.stats.find(stat => stat.getType() === statType) ? [...accu, this.stats.find(stat => stat.getType() === statType)] : accu;
    }, []);
    this.stats = this.stats
      .filter(stat => this.statsToShow.indexOf(stat.getType()) !== -1)
      .reduce((accu, stat) => [...accu, ...DynamicDataLoader.getUnitBasedDataFromDataInstance(stat, this.unitSettings)], []);
  }


}
