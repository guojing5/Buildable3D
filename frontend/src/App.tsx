import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import EligibilityPage from './pages/EligibilityPage';
import HomePage from './pages/HomePage';
import InteractionPage from './pages/InteractionPage';
import ApplyMinorVariancesPage from './pages/resources/ApplyMinorVariances';
import ChooseExpertsPage from './pages/resources/ChooseExpertsPage';
import ConsultingNeighborsPage from './pages/resources/ConsultingNeighborsPage';
import ResourcePage from './pages/resources/ResourcePage';
import StepInvolvedPage from './pages/resources/StepsInvolved';
import VerifyPage from './pages/VerifyPage';

function App() {
  return (
    <div>
      <ScrollToTop>
        <Switch>
          <Route path='/home' component={HomePage} />
          <Route path='/verify' component={VerifyPage} />
          <Route path='/eligibility' component={EligibilityPage} />
          <Route path='/interaction' component={InteractionPage} />
          <Route path='/resource/chooseexperts' component={ChooseExpertsPage} />
          <Route path='/resource/stepinvolved' component={StepInvolvedPage} />
          <Route path='/resource/consultingneighbors' component={ConsultingNeighborsPage} />
          <Route path='/resource/applyminorvariances' component={ApplyMinorVariancesPage} />
          <Route path='/resource' component={ResourcePage} />
          {/* Default route */}
          <Route path='/' component={HomePage} />
        </Switch>
      </ScrollToTop>
    </div>
  );
}

export default App;
