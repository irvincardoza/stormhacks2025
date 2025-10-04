import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Switch } from "components/ui/switch"
import { Separator } from "components/ui/separator"
import { Badge } from "components/ui/badge"
import { Plus, Trash2, Edit } from "components/icons/lucide-adapter"

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        description="Configure thresholds, categories, and privacy settings"
      />
      
      <div className="grid gap-6 px-6">
        {/* Session/Idle Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle>Session & Idle Thresholds</CardTitle>
            <CardDescription>
              Configure when sessions start/stop and what counts as idle time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session-threshold">Session Threshold (seconds)</Label>
                <Input id="session-threshold" type="number" defaultValue="30" />
                <p className="text-xs text-muted-foreground">
                  Minimum time to start a new session
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idle-threshold">Idle Threshold (seconds)</Label>
                <Input id="idle-threshold" type="number" defaultValue="300" />
                <p className="text-xs text-muted-foreground">
                  Time before considering activity as idle
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-threshold">Break Threshold (minutes)</Label>
              <Input id="break-threshold" type="number" defaultValue="15" />
              <p className="text-xs text-muted-foreground">
                Minimum idle time to count as a break
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Labeling Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Labeling Rules</CardTitle>
            <CardDescription>
              Automatically categorize applications and websites
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Productive Rules</div>
                <div className="text-sm text-muted-foreground">3 rules configured</div>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">VS Code</div>
                  <div className="text-sm text-muted-foreground">Application</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Productive</Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">github.com</div>
                  <div className="text-sm text-muted-foreground">Domain</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Productive</Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">twitter.com</div>
                  <div className="text-sm text-muted-foreground">Domain</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Unproductive</Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Control what data is collected and stored
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Redact filenames</div>
                <div className="text-sm text-muted-foreground">
                  Hide sensitive file names in window titles
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Hide screenshots by default</div>
                <div className="text-sm text-muted-foreground">
                  Don't capture screenshots unless explicitly enabled
                </div>
              </div>
              <Switch />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Anonymize domains</div>
                <div className="text-sm text-muted-foreground">
                  Replace domain names with generic categories
                </div>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Control your data retention and export options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Data Retention</div>
                <div className="text-sm text-muted-foreground">
                  Keep data for 90 days
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-muted-foreground">
                  Download your productivity data
                </div>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Delete All Data</div>
                <div className="text-sm text-muted-foreground">
                  Permanently remove all tracked data
                </div>
              </div>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
