import { Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';

@Directive({
  standalone: true,
})
export class AbstractTabGroupComponent implements OnInit, OnDestroy {
  constructor(protected route: ActivatedRoute) {}

  protected detailId!: number;

  private idSubscription!: Subscription;

  protected masterType!: string;

  ngOnInit(): void {
    this.idSubscription = this.route.params.subscribe((params: Params) => {
      if (params['id'] !== undefined) {
        this.detailId = +params['id'];
      }
    });
  }

  ngOnDestroy() {
    this.idSubscription.unsubscribe();
  }
}
