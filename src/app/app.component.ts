import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ImportsModule } from './imports';
import { Table } from 'primeng/table';
import { Customer, Representative } from '../domain/customer';
import { CustomerService } from '../service/customerservice.ts.service';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}

interface Item {
  name: string;
  [key: string]: any;
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

  @Input() dataSize: 'mini' | 'small' | 'medium' | 'large' | 'xlarge' | 'api' = 'api'; // Default to API
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
  
  selectedItem: Item | null = null;
  filteredItems: Item[] = [];
  items: Item[] = [];

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.loadColumns();
    this.loadData();
    this.loadFilters();
    // Load unique items for autocomplete
    this.loadUniqueItems();
  }
  
  // Load unique items for autocomplete to avoid duplicates
  loadUniqueItems() {
    this.loading = true;
    this.customerService.generateItems()
      .then((items: Item[]) => {
        const uniqueItemsMap = new Map<string, Item>();
        
        // Add only unique items to the map with proper type
        items.forEach((item: Item) => {
          if (item && item.name) {
            uniqueItemsMap.set(item.name, item);
          }
        });
        
        // Convert the Map values back to an array
        this.items = Array.from(uniqueItemsMap.values());
        console.log('Unique Items loaded:', this.items.length);
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading unique items:', error);
        this.loading = false;
      });
  }
  
  // Filter items without duplicates
  filterItems(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.toLowerCase() || '';
    this.filteredItems = this.items.filter((item: Item) =>
      item?.name?.toLowerCase().startsWith(query)
    );
  }

  async loadColumns() {
    try {
      // Load columns configuration
      this.columns = await this.customerService.getTableColumns();
      
      // Load filter configuration based on columns
      this.filterConfig = await this.customerService.getFilterConfig();
      
      // Initialize columns with autocomplete
      this.columns.forEach(column => {
        if (column.type === 'autocomplete') {
          column.selectedItem = null;
        }
      });
    } catch (error) {
      console.error('Error loading columns configuration:', error);
    }
  }

  loadData() {
    this.loading = true;

    // Always use API data (getCustomers) based on the dataSize parameter for filtering
    let dataPromise: Promise<Customer[]>;
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
      default:
        dataPromise = this.customerService.getCustomers();
        break;
    }

    dataPromise
      .then((customers: Customer[]) => {
        // Ensure dates are properly formatted
        this.customers = customers.map(customer => ({
          ...customer,
          date: typeof customer.date === 'string' ? new Date(customer.date) : customer.date
        }));
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading customer data:', error);
        this.loading = false;
      });
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
    
    // Reset selected autocomplete items
    this.columns.forEach(column => {
      if (column.type === 'autocomplete') {
        column.selectedItem = null;
      }
    });
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
}