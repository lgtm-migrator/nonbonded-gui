import { Component, OnDestroy, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { selectProjectState } from '@core/store/project/project.selectors';
import { Store } from '@ngrx/store';
import { State } from '@core/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project } from '@core/models/projects';
import { ProjectState } from '@core/store/project/project.interfaces';

interface BaseNavigationNode {
  name: string;
  url: string;
}

interface NestedNavigationNode extends BaseNavigationNode {
  children?: NestedNavigationNode[];
}

interface FlatNavigationNode extends BaseNavigationNode {
  expandable: boolean;
  level: number;
}

@Component({
  selector: 'app-navigation-tree',
  templateUrl: './navigation-tree.component.html',
  styleUrls: ['./navigation-tree.component.scss'],
})
export class NavigationTreeComponent implements OnInit, OnDestroy {
  private readonly dataSubscription: Subscription;

  private flattenNode = (
    node: NestedNavigationNode,
    level: number
  ): FlatNavigationNode => {
    return {
      name: node.name,
      url: node.url,
      expandable: !!node.children && node.children.length > 0,
      level: level,
    };
  };

  private treeFlattener = new MatTreeFlattener(
    this.flattenNode,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children
  );

  public project$: Observable<ProjectState>;

  public treeControl = new FlatTreeControl<FlatNavigationNode>(
    (node) => node.level,
    (node) => node.expandable
  );
  public dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(private store: Store<State>) {
    this.project$ = this.store.select(selectProjectState);

    this.dataSubscription = combineLatest([this.project$])
      .pipe(
        map(([projectState]): NestedNavigationNode[] => {
          if (!projectState || !projectState.success) return [];
          return this.buildNodes(projectState);
        })
      )
      .subscribe((innerData) => {
        if (this.dataSource.data == innerData) return;

        this.dataSource.data = innerData;
        this.treeControl.expandAll();
      });
  }

  private buildNodes(project: Project): NestedNavigationNode[] {
    return project.studies.map(
      (study): NestedNavigationNode => ({
        name: study.name,
        url: `/projects/${project.id}/studies/${study.id}`,
        children: [
          {
            name: 'Optimizations',
            url: `/projects/${project.id}/studies/${study.id}/optimizations`,
            children: study.optimizations.map(
              (value): NestedNavigationNode => ({
                name: value.name,
                url: `/projects/${project.id}/studies/${study.id}/optimizations/${value.id}`,
                children: [
                  {
                    name: 'Results',
                    url: `/projects/${project.id}/studies/${study.id}/optimizations/${value.id}/results`,
                  },
                ],
              })
            ),
          },
          {
            name: 'Benchmarks',
            url: `/projects/${project.id}/studies/${study.id}/benchmarks`,
            children: study.benchmarks.map(
              (value): NestedNavigationNode => ({
                name: value.name,
                url: `/projects/${project.id}/studies/${study.id}/benchmarks/${value.id}`,
                children: [
                  {
                    name: 'Results',
                    url: `/projects/${project.id}/studies/${study.id}/benchmarks/${value.id}/results`,
                  },
                ],
              })
            ),
          },
        ],
      })
    );
  }

  public hasChild = (_: number, node: FlatNavigationNode) => node.expandable;

  ngOnInit(): void {}

  ngOnDestroy() {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
  }
}
