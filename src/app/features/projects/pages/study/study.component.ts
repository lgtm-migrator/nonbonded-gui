import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyComponent implements OnInit, OnDestroy {
  public navbarOpen: boolean;

  private readonly routerSubscription: Subscription

  constructor(private router: Router) {
    this.navbarOpen = false;

    this.routerSubscription = router.events.pipe(
      filter((a) => a instanceof NavigationEnd)
    ).subscribe(_ => this.navbarOpen = false);
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    if (this.routerSubscription) this.routerSubscription.unsubscribe()
  }
}
