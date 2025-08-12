import { MaintenanceInterface } from "../components/MaintenanceInterface";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
              Maintenance
            </h1>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
              Cable and sensor maintenance interface with manual testing capabilities.
            </p>
          </div>
        </div>

        {/* Main Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <MaintenanceInterface />
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>
              System Uptime
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : ''}`}>
              {maintenanceData.successRate}%
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
              +2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>
              Avg Temperature
            </CardTitle>
            <Thermometer className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : ''}`}>
              {maintenanceData.averageTemperature}°C
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Range: {maintenanceData.temperatureRange.min}°C - {maintenanceData.temperatureRange.max}°C
            </p>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>
              Maintenance Response Time
            </CardTitle>
            <Clock className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : ''}`}>
              {maintenanceData.performanceMetrics.responseTime}s
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
              -0.3s from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
              <Settings className="h-5 w-5" />
              Maintenance Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>
                  Maintenance Tasks/Hour
                </span>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : ''}`}>
                  {maintenanceData.performanceMetrics.throughput} tasks/min
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(maintenanceData.performanceMetrics.throughput / 60) * 100}%` }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>
                  Equipment Failure Rate
                </span>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : ''}`}>
                  {maintenanceData.performanceMetrics.errorRate}%
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${maintenanceData.performanceMetrics.errorRate}%` }}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>
                  Maintenance Success Rate
                </span>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : ''}`}>
                  {maintenanceData.successRate}%
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${maintenanceData.successRate}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <CardTitle className={isDark ? 'text-white' : ''}>Temperature Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>
                  Normal Range (20-35°C)
                </span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">65%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>
                  Warning Range (35-40°C)
                </span>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">25%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : ''}`}>
                  Critical Range (&gt;40°C)
                </span>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">10%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : ''}`}>
            <Activity className="h-5 w-5" />
            Recent Maintenance Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceData.recentActivity.map((activity) => (
              <div key={activity.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : ''}`}>
                      {activity.message}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(activity.status)}>
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maintenance;