/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Router, Route, Redirect, Switch } from 'react-router-dom';
import axios from 'axios';

import encryption from './encryption';

import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import { MuiPickersUtilsProvider } from 'material-ui-pickers';

import { createMuiTheme } from '@material-ui/core/styles';
import { MuiThemeProvider } from '@material-ui/core/styles'; // v1.x

import { darktheme } from './themes/dark';
import { lighttheme } from './themes/light'; // eslint-disable-line no-unused-vars

import cyan from '@material-ui/core/colors/cyan';
import orange from '@material-ui/core/colors/orange';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import blueGrey from '@material-ui/core/colors/blueGrey';
import indigo from '@material-ui/core/colors/indigo';

// Component for router
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Viewer from './components/Viewer';
import Transactions from './components/Transactions';
import Changes from './components/Changes';
import Categories from './components/Categories';
import Settings from './components/Settings';
import Logout from './components/Logout';

import NoAccounts from './components/accounts/NoAccounts';

import createHistory from 'history/createBrowserHistory';
const history = createHistory();

import './main.scss';

class Main extends Component {
  constructor(props, context) {
    super(props, context);
    this.context = context;

    if (props.user.cipher) {
      encryption.key(props.user.cipher);
    }
    if (props.server.url) {
      axios.defaults.baseURL = props.server.url;
    }

    this.state = {
      theme: createMuiTheme(props.user.theme === 'dark' ? darktheme : lighttheme),
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    };
  }

  componentWillMount() {

    this._changeColor(this.props.user.theme, location);

    this.removeListener = history.listen(location => {
      this._changeColor(this.props.user.theme, location);
    });
  }

  _changeColor = (_theme, route = history.location) => {

    let theme = (_theme === 'dark' ? darktheme : lighttheme);
    if (route.pathname.startsWith('/dashboard')) {
      theme.palette.primary = blue;
      theme.palette.primary.main = blue[600];
    } else if (route.pathname.startsWith('/transactions')) {
      theme.palette.primary = cyan;
      theme.palette.primary.main = cyan[700];
    } else if (route.pathname.startsWith('/changes')) {
      theme.palette.primary = orange;
      theme.palette.primary.main = orange[800];
    } else if (route.pathname.startsWith('/categories')) {
      theme.palette.primary = green;
      theme.palette.primary.main = green[600];
    } else if (route.pathname.startsWith('/viewer')) {
      theme.palette.primary = indigo;
      theme.palette.primary.main = indigo[400];
    } else if (route.pathname.startsWith('/settings')) {
      theme.palette.primary = blueGrey;
      theme.palette.primary.main = blueGrey[500];
    } else {
      theme.palette.primary = blue;
      theme.palette.primary.main = blue[600];
    }

    theme = createMuiTheme(theme);

    const css = document.documentElement.style;
    // Edit CSS variable
    css.setProperty('--primary-color', theme.palette.primary.main);
    css.setProperty('--loading-color', theme.palette.divider);
    css.setProperty('--background-color', theme.palette.background.default);
    css.setProperty('--divider-color', theme.palette.divider);
    css.setProperty('--text-color', theme.palette.text.primary);
    css.setProperty('--paper-color', theme.palette.background.paper);
    css.setProperty('--cardheader-color', theme.palette.cardheader);

    this.setState({ theme });
  };

  componentWillUnmount() {
    this.removeListener();
  }

  componentWillReceiveProps(newProps) {
    // Server from isSyncing to Synced
    if (!this.props.server.isLogged && newProps.server.isLogged) {
      if (newProps.user.accounts && newProps.user.accounts.length === 0) {
        history.replace('/welcome');
      } else {
        this._changeColor(newProps.user.theme, history.location);
      }
    }
    // Event on theme change
    if (this.props.user.theme != newProps.user.theme) {
      this._changeColor(newProps.user.theme);
    }

    if (this.props.user.token && !newProps.user.token) {
      history.replace('/login');
    }
  }

  render() {
    const { theme } = this.state;

    const { server } = this.props;

    return (
      <MuiThemeProvider theme={createMuiTheme(theme)}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Router history={history}>
            <main>
              <div id="iPadBorder"></div>

              { server.isLogged ? (
                <aside
                  className="navigation"
                  style={{
                    color: theme.palette.text.primary,
                    borderRightColor: theme.palette.divider
                  }}
                >
                  <Route component={Navigation} />
                </aside>

              ) : ''}

              { !server.isLogged ? (
                <Route component={Login} />
              ) : (
                <div id="container" style={{
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary
                }}>
                  <div id="content">
                    <Switch>
                      <Route path="/welcome" component={NoAccounts} />
                      <Redirect exact from="/" to="/dashboard" />
                      <Redirect exact from="/login" to="/dashboard" />
                      <Redirect exact from="/resetpassword" to="/dashboard" />
                      <Route exact path="/dashboard" component={Dashboard} />
                      <Route exact path="/viewer" component={Viewer} />
                      <Redirect
                        exact
                        from="/transactions"
                        to={`/transactions/${this.state.year}/${
                          this.state.month
                        }`}
                      />
                      <Route
                        path="/transactions/:year/:month"
                        component={Transactions}
                      />
                      <Route exact path="/categories" component={Categories} />
                      <Route path="/categories/:id" component={Categories} />
                      <Route exact path="/changes" component={Changes} />
                      <Route path="/changes/:id" component={Changes} />
                      <Route path="/settings" component={Settings} />
                      <Route path="/logout" component={Logout} />
                    </Switch>
                  </div>
                </div>
              )}
            </main>
          </Router>
        </MuiPickersUtilsProvider>
      </MuiThemeProvider>
    );
  }
}

Main.propTypes = {
  dispatch: PropTypes.func.isRequired,
  user: PropTypes.object,
  server: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    server: state.server
  };
};

export default connect(mapStateToProps)(Main);