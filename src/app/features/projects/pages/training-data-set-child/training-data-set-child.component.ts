import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Store } from '@ngrx/store';

import { State } from '@core/store';

import { DataSetCollectionState } from '@core/store/datasets/datasets.interfaces';
import { getCurrentTrainingSets } from '@core/store/study-details/study-details.selectors';

@Component({
  selector: 'app-training-data-set-child',
  templateUrl: './training-data-set-child.component.html',
  styleUrls: ['./training-data-set-child.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingDataSetChildComponent implements OnInit {
  dataSets$: Observable<DataSetCollectionState>;

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.dataSets$ = this.store.select(getCurrentTrainingSets);
  }
}
