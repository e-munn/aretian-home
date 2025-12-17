'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, MapPin, Building2, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Projects', value: '12', icon: Building2, change: '+2 this month' },
    { title: 'Locations', value: '48', icon: MapPin, change: '+5 this month' },
    { title: 'Analytics', value: '156', icon: BarChart3, change: '+23 this week' },
    { title: 'Growth', value: '24%', icon: TrendingUp, change: '+4% vs last month' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Aretian Urban Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
