import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Params, ActivatedRoute } from '@angular/router';
import { Space, Spaces } from 'ngx-fabric8-wit';
import { IterationService } from './iteration.service';
import { IterationModel } from './../models/iteration.model';
import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';

import { Broadcaster } from 'ngx-base';
import { AuthenticationService } from 'ngx-login-client';

@Component({
  host: {
    'class':"app-component"
  },
  selector: 'fab-planner-iteration',
  templateUrl: './iteration.component.html',
  styleUrls: ['./iteration.component.scss']
})
export class IterationComponent implements OnInit, OnDestroy, OnChanges {

  @Input() takeFromInput: boolean = false;
  @Input() iterations: IterationModel[] = [];

  authUser: any = null;
  loggedIn: Boolean = true;
  editEnabled: Boolean = false;
  isBacklogSelected: Boolean = true;
  isCollapsedIteration: Boolean = false;
  isCollapsedCurrentIteration: Boolean = false;
  isCollapsedFutureIteration: Boolean = true;
  isCollapsedPastIteration: Boolean = true;
  barchatValue: number = 70;
  allIterations: IterationModel[] = [];
  futureIterations: IterationModel[] = [];
  currentIterations: IterationModel[] = [];
  closedIterations: IterationModel[] = [];

  private spaceSubscription: Subscription = null;

  constructor(
    private auth: AuthenticationService,
    private broadcaster: Broadcaster,
    private iterationService: IterationService,
    private route: ActivatedRoute,
    private spaces: Spaces
  ) {}

  ngOnInit(): void {
    this.listenToEvents();
    this.loggedIn = this.auth.isLoggedIn();
    this.getAndfilterIterations();
    this.editEnabled = true;
    this.spaceSubscription = this.spaces.current.subscribe(space => {
      if (space) {
        console.log('[IterationComponent] New Space selected: ' + space.attributes.name);
        console.log(space);
        this.editEnabled = true;
        this.getAndfilterIterations();
      } else {
        console.log('[IterationComponent] Space deselected.');
        this.editEnabled = false;
        this.allIterations = [];
        this.futureIterations = [];
        this.currentIterations = [];
        this.closedIterations = [];
      }
    });
  }

  ngOnChanges() {
    if (this.takeFromInput) {
      this.allIterations = this.iterations;
      this.clusterIterations();
    }
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.spaceSubscription.unsubscribe();
  }

  getAndfilterIterations() {
    if (this.takeFromInput) {
      this.allIterations = this.iterations;
      this.clusterIterations();
    } else {
      this.iterationService.getIterations()
      .subscribe((iterations) => {
          this.allIterations = iterations;
          this.clusterIterations();
      },
      (e) => {
        console.log('Some error has occured', e);
      });
    }
  }

  clusterIterations() {
    this.futureIterations = this.allIterations.filter((iteration) => iteration.attributes.state === 'new');
    this.currentIterations = this.allIterations.filter((iteration) => iteration.attributes.state === 'start');
    this.closedIterations = this.allIterations.filter((iteration) => iteration.attributes.state === 'close');
  }

  onCreateOrupdateIteration(iteration: IterationModel) {
    let index = this.allIterations.findIndex((it) => it.id === iteration.id);
    if (index >= 0) {
      this.allIterations[index] = iteration;
    } else {
      this.allIterations.splice(this.allIterations.length, 0, iteration);
    }
    this.clusterIterations();
  }

  getWorkItemsByIteration(iteration: IterationModel) {
    let filters: any = [];
    if (iteration)
    {
      this.isBacklogSelected = false;
      filters.push({
        id:  iteration.id,
        name: iteration.attributes.name,
        paramKey: 'filter[iteration]',
        active: true,
        value: iteration.id
      });
    } else {
      //This is to view the backlog
      this.isBacklogSelected = true;
      //Collapse the other iteration sets
      this.isCollapsedCurrentIteration = true;
      this.isCollapsedFutureIteration = true;
      this.isCollapsedPastIteration = true;
      filters.push({
        paramKey: 'filter[iteration]',
        active: false,
      });
    }
    this.broadcaster.broadcast('unique_filter', filters);
  }

  listenToEvents() {
    this.broadcaster.on<string>('logout')
      .subscribe(message => {
        this.loggedIn = false;
        this.authUser = null;
    });
    this.broadcaster.on<string>('wi_change_state_it')
      .subscribe((actions: any) => {
        actions.forEach((data: any) => {
          let iteration: IterationModel = this.allIterations.find((it) => it.id == data.iterationId);
          if (iteration) {
            iteration.relationships.workitems.meta.closed += data.closedItem;
          }
        });
    });
    this.broadcaster.on<string>('associate_iteration')
      .subscribe((data: any) => {
        let currentIteration: IterationModel = this.allIterations.find((it) => it.id == data.currentIterationId);
        if (currentIteration) {
          currentIteration.relationships.workitems.meta.total -= 1;
        }
        let futureIteration: IterationModel = this.allIterations.find((it) => it.id == data.futureIterationId);
        if (futureIteration) {
          futureIteration.relationships.workitems.meta.total += 1;
        }
    });
  }
 }
