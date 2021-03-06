import {
  Component,
  Input,
  ViewChild,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output
} from "@angular/core";
import {
  MatPaginator,
  MatSort,
  MatTableDataSource,
  MatSortable,
  MatSortHeader
} from "@angular/material";
import { SelectionModel } from "@angular/cdk/collections";
import { EventEmitter } from "@angular/core";

@Component({
  selector: "datatable",
  template: `
    <mat-card>
      <mat-form-field>
        <input (keyup)="filterBy($event)" matInput placeholder="Filter" />
      </mat-form-field>

      <mat-table [dataSource]="dataSource" matSort>
        <ng-container *ngIf="!isLoading">
          <ng-container
            matColumnDef="{{ column }}"
            *ngFor="let column of columns; let i = index"
          >
            <span>
              <mat-header-cell mat-sort-header *matHeaderCellDef>
                {{ column | fieldToDisplay }}
              </mat-header-cell>
              <mat-cell *matCellDef="let element">
                <ng-container [ngSwitch]="columnDefs[column].type">
                  <ng-container *ngSwitchCase="'dropdown'">
                    <mat-select
                      [(ngModel)]="element.active"
                      (click)="$event.stopPropagation()"
                    >
                      <mat-option
                        [value]="element[column]"
                        *ngFor="let option of columnDefs[column].data"
                      >
                        {{ option }}
                      </mat-option>
                    </mat-select>
                  </ng-container>
                  <ng-container *ngSwitchCase="'number'">
                    <number
                      [options]="columnDefs[column]"
                      [element]="element"
                      [column]="column"
                    >
                    </number>
                  </ng-container>
                  <ng-container *ngSwitchCase="'checkbox'">
                    <mat-checkbox
                      (click)="$event.stopPropagation()"
                      [(ngModel)]="element[column]"
                    ></mat-checkbox>
                  </ng-container>
                  <ng-container *ngSwitchCase="'none'"></ng-container>
                  <ng-container *ngSwitchDefault>
                    {{
                      columnDefs[column].uppercase
                        ? (element[column] | uppercase)
                        : ""
                    }}
                  </ng-container>
                </ng-container>
              </mat-cell>
            </span>
          </ng-container>
        </ng-container>
        <mat-header-row
          *matHeaderRowDef="columns; sticky: true"
        ></mat-header-row>
        <mat-row
          *matRowDef="let row; columns: columns"
          [style.background]="selection.isSelected(row) ? selectedRowClass : ''"
          (click)="onRowClick(row)"
        ></mat-row>
      </mat-table>
      <mat-spinner *ngIf="isLoading"></mat-spinner>
    </mat-card>
  `,
  styles: [``]
})
export class DatatableComponent implements OnInit, OnChanges {
  @Input()
  public isLoading = false;
  @Input()
  public selectable = true;
  @Input()
  public data: any;
  @Input()
  public columnDefs: any;
  @Input()
  public displayedColumns: any[] = [];
  @Output()
  public selectionChange = new EventEmitter();

  public selectedRowClass = "lightblue";

  public dataSource = new MatTableDataSource<any>();
  public columns = [];
  public selection = new SelectionModel<any>(true, []);

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  public ngOnInit(): void {
    console.log("[ngOnInit]", this.data);
  }

  public sortBy(id, start?: "asc" | "desc") {
    start = start || "asc";
    const matSort = this.dataSource.sort;
    const disableClear = false;

    // reset state so that start is the first sort direction that you will see
    matSort.sort({ id: null, start, disableClear });
    matSort.sort({ id, start, disableClear });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    console.log("[ngOnChanges]", changes);
    this.updateTable();
    this.selection.clear();
  }

  public onRowClick(row: any): void {
    if (this.selectable) {
      this.selection.toggle(row);
      this.selectionChange.emit(this.selection.selected);
    }
  }

  public filterBy(event: any): void {
    const filterBy: string = event.target.value;
    this.dataSource.filter = filterBy;
  }

  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  private updateRows(): void {
    this.dataSource = new MatTableDataSource<any>(this.data);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private updateColumns(): void {
    this.columns = [];
    this.displayedColumns.forEach(column => {
      if (this.columnDefs[column].visible) {
        this.columns.push(column);
      }
    });
  }

  private updateTable(): void {
    if (this.data) {
      this.updateRows();
      this.updateColumns();
    }
  }
}
