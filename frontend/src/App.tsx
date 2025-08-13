import React from 'react';
import { Route } from 'react-router-dom';
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
      <Route path='/home'>
        <HomePage />
      </Route>
      <Route path='/verify'>
        <VerifyPage />
      </Route>
      <Route path='/eligibility'>
        <EligibilityPage />
      </Route>
      <Route path='/interaction'>
        <InteractionPage />
      </Route>
      <Route path='/resource/chooseexperts'>
        <ChooseExpertsPage />
      </Route>
      <Route path='/resource/stepinvolved'>
        <StepInvolvedPage />
      </Route>
      <Route path='/resource/consultingneighbors'>
        <ConsultingNeighborsPage />
      </Route>
      <Route path='/resource/applyminorvariances'>
        <ApplyMinorVariancesPage />
      </Route>
      <Route exact path='/resource'>
        <ResourcePage />
      </Route>
      </ScrollToTop>

    </div>
  );
}

export default App;
