// Copied from: https://stackoverflow.com/questions/36904185/react-router-scroll-to-top-on-every-transition

import React, { useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { History } from 'history'

function ScrollToTop(props: { history: History<unknown>, children: any }) {
  useEffect(() => {
    const unlisten = props.history.listen(() => {
      // @ts-ignore - behavior should have 'instant'
      window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    });
    return () => {
      unlisten();
    }
  }, []);

  return <Fragment>{props.children}</Fragment>;
}

// @ts-ignore
export default withRouter(ScrollToTop);