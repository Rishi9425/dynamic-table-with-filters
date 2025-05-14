import { Injectable } from '@angular/core';
import tableData from '../assets/table-data.json'; // Import JSON directly

@Injectable()
export class CustomerService {
    private customerConfig = tableData;

    constructor() {}

    getCustomers(): Promise<any[]> {
        return Promise.resolve(this.customerConfig.data);
    }

    getCustomersMini(): Promise<any[]> {
        return Promise.resolve(this.customerConfig.data.slice(0, 2));
    }

    getCustomersSmall(): Promise<any[]> {
        return Promise.resolve(this.customerConfig.data.slice(0, 5));
    }

    getCustomersMedium(): Promise<any[]> {
        return Promise.resolve(this.customerConfig.data.slice(0, 10));
    }

    getCustomersLarge(): Promise<any[]> {
        return Promise.resolve(this.customerConfig.data.slice(0, 15));
    }

    getCustomersXLarge(): Promise<any[]> {
        return Promise.resolve(this.customerConfig.data.slice(0, 25));
    }

    getUniqueRepresentatives(): Promise<any[]> {
        const repMap = new Map<string, any>();
        this.customerConfig.data.forEach(customer => {
            if (customer.representative && !repMap.has(customer.representative.name)) {
                repMap.set(customer.representative.name, customer.representative);
            }
        });
        return Promise.resolve(Array.from(repMap.values()));
    }

    getUniqueStatuses(): Promise<{ label: string; value: string }[]> {
        const statusSet = new Set<string>();
        this.customerConfig.data.forEach(customer => {
            if (customer.status) {
                statusSet.add(customer.status);
            }
        });
        const statuses = Array.from(statusSet).map(status => ({
            label: this.capitalizeFirstLetter(status),
            value: status
        }));
        return Promise.resolve(statuses);
    }

    getTableColumns(): Promise<any[]> {
        return Promise.resolve(this.customerConfig.columns);
    }

    getFilterConfig(): Promise<any> {
        const globalFilterFields: string[] = [];
        const filters: Record<string, any> = {};

        this.customerConfig.columns.forEach(col => {
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


generateItems(): any[] {
    const items: any[] = [];
    if (this.customerConfig?.data?.length) {
        this.customerConfig.data.forEach(customer => items.push({ name: customer.name }));
    } else {
        console.error('Customer data is not loaded or empty.');
    }
    return items;
}

}