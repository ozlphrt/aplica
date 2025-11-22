import Layout from './components/shared/Layout';
import { Card, CardHeader, CardContent, CardFooter } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';

function App() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="w-full max-w-2xl">
          {/* Welcome Card */}
          <Card glassmorphic={true}>
            <CardContent className="text-center pt-8">
              {/* Progress bar example */}
              <div className="mb-6">
                <Progress value={0} showLabel={false} className="mb-2" />
                <p className="text-sm text-white/60">Start your profile to see matches</p>
              </div>
              
              {/* Badge examples - Subtle colors */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <Badge variant="reach">Reach</Badge>
                <Badge variant="target">Target</Badge>
                <Badge variant="safety">Safety</Badge>
                <Badge variant="affordable">Affordable</Badge>
              </div>
            </CardContent>
            
            <CardFooter className="justify-center">
              <Button variant="primary" size="lg" className="shadow-lg">
                Get Started
              </Button>
            </CardFooter>
          </Card>
          
          {/* Component Test Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card glassmorphic={true}>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Button Variants</h3>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="danger" size="sm">Danger</Button>
              </CardContent>
            </Card>
            
            <Card glassmorphic={true}>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Progress Example</h3>
              </CardHeader>
              <CardContent>
                <Progress value={45} showLabel={true} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;

