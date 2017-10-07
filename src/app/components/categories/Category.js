import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Card, CardText} from 'material-ui/Card';

import muiThemeable from 'material-ui/styles/muiThemeable';
import CircularProgress from 'material-ui/CircularProgress';


import IconButton from 'material-ui/IconButton';
import NavigateBefore from 'material-ui/svg-icons/image/navigate-before';

import {green500, green600, white} from 'material-ui/styles/colors';

import AccountStore from '../../stores/AccountStore';
import CategoryStore from '../../stores/CategoryStore';
import CategoryActions from '../../actions/CategoryActions';
import CurrencyStore from '../../stores/CurrencyStore';
import TransactionStore from '../../stores/TransactionStore';
import TransactionActions from '../../actions/TransactionActions';

import TransactionTable from '../transactions/TransactionTable';

const styles = {
  loading: {
    textAlign: 'center',
    padding: '50px 0',
  },
  button: {
    float: 'right',
    marginTop: '12px',
  },
  card: {
    width: '400px',
  },
  actions: {
    width: '30px',
  }
};

class Category extends Component {

  constructor(props, context) {
    super(props, context);
    this.history = props.history;
    this.state = {
      id: props.id,
      category: null,
      transactions: new Set(),
      stats: {},
      counter: 0,
      loading: true,
      selectedTransaction: {},
      open: false,
      snackbar: {
        open: false,
        message: ''
      },
      primaryColor: props.muiTheme.palette.primary1Color,
    };
    this.context = context;
  }

  updateCategory = (category) => {
    if (category && !Array.isArray(category)) {
      this.setState({
        category: category,
      });
    }
  };

  updateTransaction = () => {
    this.setState({
      loading: true,
      open: false,
    });
    TransactionActions.read({
      category: this.state.id
    });
  };

  changeTransactions = (args) => {
    if (args && args.transactions && Array.isArray(args.transactions)) {
      let statsIndexed = {};
      // For each transaction, we clean data and
      args.transactions.forEach((transaction) => {
        // Format date
        let dateObject = new Date(transaction.date);

        // Count per month
        if (!statsIndexed[dateObject.getFullYear()]) {
          statsIndexed[dateObject.getFullYear()] = {};
        }
        if (!statsIndexed[dateObject.getFullYear()][dateObject.getMonth()+1]) {
          statsIndexed[dateObject.getFullYear()][dateObject.getMonth()+1] = {
            counter: 0,
            sum: 0,
          };
        }
        var month = statsIndexed[dateObject.getFullYear()][dateObject.getMonth()+1];
        month.counter++;
        month.sum += transaction.amount;
      });

      // Generate array
      let statsList = [];
      let data = new Map();

      Object.keys(statsIndexed).forEach((year) => {
        Object.keys(statsIndexed[year]).forEach((month) => {
          statsList.push({
            date: year+'-'+month,
            sum: statsIndexed[year][month].sum,
          });
          data.set(moment(year+'-'+month, 'YYYY-MM').format('MMM YYYY'), parseFloat(statsIndexed[year][month].sum.toFixed(2))*-1);
        });
      });

      this.setState({
        loading: false,
        open: false,
        stats: statsList,
        transactions: args.transactions,
      });
    }
  };

  updateAccount = (args) => {
    this.setState({
      loading: true,
      open: false,
    });
    TransactionActions.read({
      category: this.state.id
    });
  };

  _deleteData = (deletedItem) => {
    let list = this.state.transactions.filter((item) => { return item.id != deletedItem.id });
    this.setState({
      transactions: list,
    });
    this.changeTransactions(list);
  };

  componentWillReceiveProps(nextProps) {
    window.scrollTo(0, 0);

    this.setState({
      id: nextProps.id,
      category: null,
      transactions: new Set(),
      stats: {},
      counter: 0,
      open: false,
      loading: true,
      primaryColor: nextProps.muiTheme.palette.primary1Color
    });
    CategoryActions.read({
      id: nextProps.id
    });
    TransactionActions.read({
      category: nextProps.id
    });
  }

  componentWillMount() {
    AccountStore.addChangeListener(this.updateAccount);
    TransactionStore.addChangeListener(this.changeTransactions);
    TransactionStore.addAddListener(this.updateTransaction);
    TransactionStore.addUpdateListener(this.updateTransaction);
    TransactionStore.addDeleteListener(this._deleteData);
    CategoryStore.addChangeListener(this.updateCategory);
  }

  componentDidMount() {
    CategoryActions.read({
      id: this.state.id
    });
    TransactionActions.read({
      category: this.state.id
    });
  }

  componentWillUnmount() {
    AccountStore.removeChangeListener(this.updateAccount);
    TransactionStore.removeChangeListener(this.changeTransactions);
    TransactionStore.removeAddListener(this.updateTransaction);
    TransactionStore.removeUpdateListener(this.updateTransaction);
    TransactionStore.removeDeleteListener(this._deleteData);
    CategoryStore.removeChangeListener(this.updateCategory);
  }

  render() {
    return (
      <div className="categoryLayout">
        <header>
          <h2>{ this.state.category ? this.state.category.name : '' }</h2>
        </header>
        <div className="graph">
          { this.state.loading || !this.state.category ?
            <div style={styles.loading}>
              <CircularProgress />
            </div>
          :
            <div className="graphCanvas">
            </div>
          }
        </div>
        <div className="list">
          { this.state.loading || !this.state.category ?
            <div style={styles.loading}>
              <CircularProgress />
            </div>
          :
            <div>
              {this.state.transactions.length === 0 ?
                <p>You have no transaction</p>
                :
                <p>Broken</p>
              }
            </div>
          }
        </div>
      </div>
    );
  }
}

// <TransactionTable
// transactions={this.state.transactions}
// categories={[this.state.category]}
// dateFormat="DD MMM YY">
// </TransactionTable>

export default muiThemeable()(Category);
