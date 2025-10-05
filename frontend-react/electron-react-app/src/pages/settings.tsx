import { PageHeader } from "components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card"
import { Button } from "components/ui/button"
import { Input } from "components/ui/input"
import { Label } from "components/ui/label"
import { Switch } from "components/ui/switch"
import { Separator } from "components/ui/separator"
import { Badge } from "components/ui/badge"
import { Plus, Trash2, Edit } from "components/icons/lucide-adapter"
import { useSettingsData } from "providers/dashboard-data-provider"

export function SettingsPage() {
  const { thresholds, rules, privacy, dataManagement } = useSettingsData()

  const getRuleVariant = (productivity: string) => {
    if (productivity === "productive") return "default" as const
    if (productivity === "unproductive") return "destructive" as const
    return "secondary" as const
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        description="Configure thresholds, categories, and privacy settings"
      />
      
      <div className="grid gap-6 px-6">
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
                <Input id="session-threshold" type="number" defaultValue={thresholds.sessionSeconds} />
                <p className="text-xs text-muted-foreground">
                  Minimum time to start a new session
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idle-threshold">Idle Threshold (seconds)</Label>
                <Input id="idle-threshold" type="number" defaultValue={thresholds.idleSeconds} />
                <p className="text-xs text-muted-foreground">
                  Time before considering activity as idle
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-threshold">Break Threshold (minutes)</Label>
              <Input id="break-threshold" type="number" defaultValue={thresholds.breakMinutes} />
              <p className="text-xs text-muted-foreground">
                Minimum idle time to count as a break
              </p>
            </div>
          </CardContent>
        </Card>

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
                <div className="text-sm text-muted-foreground">{rules.length} rules configured</div>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
            
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{rule.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {rule.resourceType === "application" ? "Application" : "Domain"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRuleVariant(rule.productivity)}>
                      {rule.productivity}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              <Switch defaultChecked={privacy.redactFilenames} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Hide screenshots by default</div>
                <div className="text-sm text-muted-foreground">
                  Don't capture screenshots unless explicitly enabled
                </div>
              </div>
              <Switch defaultChecked={privacy.hideScreenshots} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Anonymize domains</div>
                <div className="text-sm text-muted-foreground">
                  Replace domain names with generic categories
                </div>
              </div>
              <Switch defaultChecked={privacy.anonymizeDomains} />
            </div>
          </CardContent>
        </Card>

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
                  Keep data for {dataManagement.retentionDays} days
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
                  {dataManagement.exportLabel}
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
                  {dataManagement.deleteLabel}
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
