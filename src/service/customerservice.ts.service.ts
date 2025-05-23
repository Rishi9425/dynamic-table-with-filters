import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import tableData from '../assets/table-data.json'; // Import JSON for columns only
import { Customer, Representative } from '../domain/customer';

interface Item {
  name: string;
  [key: string]: any;
}

@Injectable()
export class CustomerService {
  private apiUrl = 'http://localhost:5263/api/table/customers';
  private customerColumns = tableData.columns; // Keep using the columns from JSON

  constructor(private http: HttpClient) { }

  async getCustomers(): Promise<Customer[]> {
    try {
      return lastValueFrom(this.http.get<Customer[]>(this.apiUrl));
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  async getCustomersMini(): Promise<Customer[]> {
    try {
      const data = await lastValueFrom(this.http.get<Customer[]>(this.apiUrl));
      return data.slice(0, 2);
    } catch (error) {
      console.error('Error fetching mini customers:', error);
      return [];
    }
  }

  async getCustomersSmall(): Promise<Customer[]> {
    try {
      const data = await lastValueFrom(this.http.get<Customer[]>(this.apiUrl));
      return data.slice(0, 5);
    } catch (error) {
      console.error('Error fetching small customers:', error);
      return [];
    }
  }

  async getCustomersMedium(): Promise<Customer[]> {
    try {
      const data = await lastValueFrom(this.http.get<Customer[]>(this.apiUrl));
      return data.slice(0, 10);
    } catch (error) {
      console.error('Error fetching medium customers:', error);
      return [];
    }
  }

  async getCustomersLarge(): Promise<Customer[]> {
    try {
      const data = await lastValueFrom(this.http.get<Customer[]>(this.apiUrl));
      return data.slice(0, 15);
    } catch (error) {
      console.error('Error fetching large customers:', error);
      return [];
    }
  }

  async getCustomersXLarge(): Promise<Customer[]> {
    try {
      const data = await lastValueFrom(this.http.get<Customer[]>(this.apiUrl));
      return data.slice(0, 25);
    } catch (error) {
      console.error('Error fetching xlarge customers:', error);
      return [];
    }
  }

  async getUniqueRepresentatives(): Promise<Representative[]> {
    try {
      const data = await lastValueFrom(this.http.get<Customer[]>(this.apiUrl));
      const repMap = new Map<string, Representative>();

      data.forEach(customer => {
        if (
          customer.representative &&
          typeof customer.representative.name === 'string' &&
          customer.representative.name
          && !repMap.has(customer.representative.name)
        ) {
          repMap.set(customer.representative.name, customer.representative);
        }
      });

      return Array.from(repMap.values());
    } catch (error) {
      console.error('Error fetching representatives:', error);
      return [];
    }
  }

  async getUniqueStatuses(): Promise<{ label: string; value: string }[]> {
    try {
      const data = await lastValueFrom(this.http.get<Customer[]>(this.apiUrl));
      const statusSet = new Set<string>();

      data.forEach(customer => {
        if (customer.status) {
          statusSet.add(customer.status);
        }
      });

      const statuses = Array.from(statusSet).map(status => ({
        label: this.capitalizeFirstLetter(status),
        value: status
      }));

      return statuses;
    } catch (error) {
      console.error('Error fetching statuses:', error);
      return [];
    }
  }

  getTableColumns(): Promise<any[]> {
    return Promise.resolve(this.customerColumns);
  }

  getFilterConfig(): Promise<any> {
    const globalFilterFields: string[] = [];
    const filters: Record<string, any> = {};

    this.customerColumns.forEach(col => {
      if (col.filter) {
        if (col.type === 'text' || ['name', 'country.name', 'representative.name', 'status'].includes(col.field)) {
          globalFilterFields.push(col.field);
        }

        const display = 'menu';

        switch (col.type) {
          case 'text':
            filters[col.field] = { type: 'text', display };
            break;
          case 'date':
            filters[col.field] = { type: 'date', display };
            break;
          case 'currency':
            filters[col.field] = {
              type: 'numeric',
              display,
              currency: col.currency || 'USD'
            };
            break;
          case 'boolean':
            filters[col.field] = { type: 'boolean', display };
            break;
          case 'tag':
            filters[col.field] = { type: 'tag', display };
            break;
          case 'progressbar':
            filters[col.field] = { type: 'progressbar', display };
            break;
          case 'autocomplete':
            filters[col.field] = { type: 'autocomplete', display };
            break;
          default:
            filters[col.field] = { type: 'text', display };
        }
      }
    });

    return Promise.resolve({
      globalFilterFields,
      filters
    });
  }

  private capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async generateItems(): Promise<Item[]> {
    try {
      const data = await lastValueFrom(this.http.get<Customer[]>(this.apiUrl));
      const items: Item[] = [];
      
      data.forEach(customer => {
        if (customer && customer.name) {
          items.push({ name: customer.name });
        }
      });
      
      return items;
    } catch (error) {
      console.error('Error fetching customer data for items:', error);
      return [];
    }
  }
}