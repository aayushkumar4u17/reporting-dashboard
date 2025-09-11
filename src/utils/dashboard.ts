// TypeScript interfaces for dashboard data

export interface PointOfContactDashboardData {
  cancelled_count: number;
  cancelled_qty: number;
  delivered_orders: number;
  delivered_qty: number;
  order_count: number;
  ordered_qty: number;
  planned_orders: number;
  planned_qty: number;
  rescheduled_count: number;
  rescheduled_qty: number;
}

export interface DashboardMetrics {
  totalOrdersPlaced: {
    count: number;
    quantity: number;
  };
  totalOrdersDelivered: {
    count: number;
    quantity: number;
  };
  totalOrdersRescheduled: {
    count: number;
    quantity: number;
  };
  totalOrdersCancelled: {
    count: number;
    quantity: number;
  };
  totalCostSaved: {
    quantity: string;
    amount: string;
  };
}

// Adding a comment to trigger file change detection