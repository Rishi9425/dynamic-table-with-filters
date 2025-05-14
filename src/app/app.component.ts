import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ImportsModule } from './imports';
import { Table } from 'primeng/table';
import { Customer, Representative } from '../domain/customer';
import { CustomerService } from '../service/customerservice.ts.service';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { filter } from 'rxjs';

interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}

@Component({
  selector: 'table-filter-advanced-demo',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [ImportsModule, FormsModule, AutoCompleteModule],
  providers: [CustomerService]
})
export class TableFilterAdvancedDemo implements OnInit {
  title: string = 'table';

  @Input() dataSize: 'mini' | 'small' | 'medium' | 'large' | 'xlarge' | 'api' = 'medium';
  @ViewChild('dt1') table!: Table;

  // Dynamic columns configuration
  columns: any[] = [];
  
  filterConfig: any = {
    globalFilterFields: [],
    filters: {}
  };

  customers: Customer[] = [];
  representatives: Representative[] = [];
  statuses: { label: string; value: string }[] = [];
  loading: boolean = true;
  activityValues: number[] = [0, 100];
    selectedItem: any;
  filteredItems: any[] = [];
  items: any[] = [];
    filterValues: {[key: string]: any} = {};
     filters: { [key: string]: any } = {};

  // Holds the filtered list per field
  filteredAutocompleteItems: { [field: string]: any[] } = {};

  // Full list of items for autocompletegenerateItems
  autocompleteItems: { [field: string]: any[] } = {};


  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadColumns();
    this.loadData();
    this.loadFilters();
     this.items = this.customerService.generateItems();
     console.log('Items:', this.items);
  }
  //for autocomplete

  filterItems(event: AutoCompleteCompleteEvent): void {
  const query = event.query?.toLowerCase() || '';
  this.filteredItems = (this.items as any[]).filter(item =>
    item?.name?.toLowerCase().startsWith(query)
  );
}


  async loadColumns() {
    try {
      // Load columns configuration
      this.columns = await this.customerService.getTableColumns();
      
      // Load filter configuration based on columns
      this.filterConfig = await this.customerService.getFilterConfig();
      
      // Initialize autocomplete items collections
      this.columns.forEach(column => {
        if (column.type === 'autocomplete') {
          this.autocompleteItems[column.field] = [];
          this.filteredAutocompleteItems[column.field] = [];
        }
      });
    } catch (error) {
      console.error('Error loading columns configuration:', error);
    }
  }

  loadData() {
    this.loading = true;

    let dataPromise: Promise<any[]>;
    switch (this.dataSize) {
      case 'mini':
        dataPromise = this.customerService.getCustomersMini();
        break;
      case 'small':
        dataPromise = this.customerService.getCustomersSmall();
        break;
      case 'medium':
        dataPromise = this.customerService.getCustomersMedium();
        break;
      case 'large':
        dataPromise = this.customerService.getCustomersLarge();
        break;
      case 'xlarge':
        dataPromise = this.customerService.getCustomersXLarge();
        break;
      case 'api':
        dataPromise = this.customerService.getCustomers();
        break;
      default:
        dataPromise = this.customerService.getCustomersMedium();
    }

    dataPromise.then((customers) => {
      this.customers = customers.map(customer => ({
        ...customer,
        date: typeof customer.date === 'string' ? new Date(customer.date) : customer.date
      }));
      this.loading = false;
      
      // Extract unique values for autocomplete fields
      this.populateAutocompleteItems();
    }).catch(error => {
      console.error('Error loading customer data:', error);
      this.loading = false;
    });
  }

  // Populate autocomplete items with actual data from the dataset
  populateAutocompleteItems() {
    this.columns.forEach(column => {
      if (column.type === 'autocomplete') {
        const field = column.field;
        
        // Get the unique values from the data
        const uniqueValues = new Set<string>();
        
        this.customers.forEach(customer => {
          const value = this.getFieldValue(customer, field);
          if (value !== null && value !== undefined && value !== '') {
            // Handle both string values and object values with a name property
            if (typeof value === 'object' && value.name) {
              uniqueValues.add(value.name);
            } else if (typeof value === 'string') {
              uniqueValues.add(value);
            }
          }
        });
        
        // Create items for autocomplete
        this.autocompleteItems[field] = Array.from(uniqueValues).map(val => ({
          name: val,
          value: val
        }));
        
        // Initialize filtered list with all items
        this.filteredAutocompleteItems[field] = [...this.autocompleteItems[field]];
      }
    });
  }

  // Method to filter autocomplete suggestions based on user input
  filterAutocomplete(event: AutoCompleteCompleteEvent, field: string) {
    const query = event.query.toLowerCase();
    
    this.filteredAutocompleteItems[field] = this.autocompleteItems[field].filter(
      item => item.name.toLowerCase().indexOf(query) !== -1
    );
  }

  async loadFilters() {
    try {
      this.representatives = await this.customerService.getUniqueRepresentatives();
      const statusList = await this.customerService.getUniqueStatuses();
      this.statuses = statusList.map(status => ({
        label: this.capitalizeFirstLetter(status.value),
        value: status.value
      }));
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  }

  getFieldValue(obj: any, field: string): any {
    const fields = field.split('.');
    let value = obj;
    for (let f of fields) {
      if (value === null || value === undefined) return '';
      value = value[f];
    }
    return value;
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  clear(table: Table) {
    table.clear();
    this.activityValues = [0, 100];
  }

  getSeverity(status: string) {
    switch (status?.toLowerCase()) {
      case 'unqualified':
        return 'danger';
      case 'qualified':
        return 'success';
      case 'new':
        return 'info';
      case 'negotiation':
        return 'warn';
      case 'renewal':
        return null;
      case 'proposal':
        return 'info';
      default:
        return 'info';
    }
  }

  onGlobalFilter(event: Event, table: Table): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || '';
    table.filterGlobal(value, 'contains');
  }

  getGlobalFilterFields(): string[] {
    return this.filterConfig.globalFilterFields || ['name', 'country.name', 'representative.name', 'status'];
  }

  getColumnWidth(column: any): string {
    if (column.field === 'verified') {
      return 'min-width:3rem';
    }
    else if (column.type === 'progressbar' || column.type === 'currency' || column.type === 'date' || column.type === 'boolean') {
      return 'min-width:10rem';
    } 
    return 'min-width:15rem';
  }

  // Helper methods for column filtering
  isDateFilterActive(field: string): boolean {
    if (!this.table) return false;
    return this.table.hasFilter();
  }
}
