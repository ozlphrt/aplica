import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/shared/Layout';
import { Card, CardHeader, CardContent, CardFooter } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import ProfileQuestionnaire from './components/student/ProfileQuestionnaire';
import Results from './pages/Results';
import CollegeDetail from './pages/CollegeDetail';
import MyList from './pages/MyList';
// LiveAPISearch component available for background use but not displayed

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 pt-2 pb-4">
      <div className="w-full max-w-6xl">
        {/* Welcome Card */}
        <Card glassmorphic={true}>
          <CardContent className="text-center pt-6">
            {/* Progress bar example */}
            <div className="mb-6">
              <Progress value={0} showLabel={false} showDot={true} className="mb-2" />
              <p className="text-sm text-white/60">Start your profile to see matches</p>
            </div>
            
            {/* College List Categories - 2x2 matrix */}
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
              {/* Reach Card */}
              <Card glassmorphic={true} className="p-4 min-h-[140px] flex flex-col">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-semibold text-white mb-1">Reach</h3>
                  <div className="mb-2">
                    <Progress value={0} showLabel={false} className="mb-1" />
                    <p className="text-xs text-white/60">0 / 8 colleges</p>
                  </div>
                  <p className="text-xs text-white/70 leading-tight">Highly selective schools</p>
                </div>
              </Card>

              {/* Target Card */}
              <Card glassmorphic={true} className="p-4 min-h-[140px] flex flex-col">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-semibold text-white mb-1">Target</h3>
                  <div className="mb-2">
                    <Progress value={0} showLabel={false} className="mb-1" />
                    <p className="text-xs text-white/60">0 / 8 colleges</p>
                  </div>
                  <p className="text-xs text-white/70 leading-tight">Good match schools</p>
                </div>
              </Card>

              {/* Safety Card */}
              <Card glassmorphic={true} className="p-4 min-h-[140px] flex flex-col">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-semibold text-white mb-1">Safety</h3>
                  <div className="mb-2">
                    <Progress value={0} showLabel={false} className="mb-1" />
                    <p className="text-xs text-white/60">0 / 4 colleges</p>
                  </div>
                  <p className="text-xs text-white/70 leading-tight">Backup options</p>
                </div>
              </Card>

              {/* Affordable Card */}
              <Card glassmorphic={true} className="p-4 min-h-[140px] flex flex-col">
                <div className="text-center flex-1 flex flex-col justify-between">
                  <h3 className="text-base font-semibold text-white mb-1">Affordable</h3>
                  <div className="mb-2">
                    <Progress value={0} showLabel={false} className="mb-1" />
                    <p className="text-xs text-white/60">0 / 5 colleges</p>
                  </div>
                  <p className="text-xs text-white/70 leading-tight">Within budget</p>
                </div>
              </Card>
            </div>
          </CardContent>
          
          <CardFooter className="justify-center">
            <Button 
              variant="primary" 
              size="lg" 
              className="shadow-lg"
              onClick={() => navigate('/profile')}
            >
              Get Started
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfileQuestionnaire />} />
        <Route path="/results" element={<Results />} />
        <Route path="/college/:id" element={<CollegeDetail />} />
        <Route path="/my-list" element={<MyList />} />
      </Routes>
    </Layout>
  );
}

export default App;
