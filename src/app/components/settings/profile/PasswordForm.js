/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
 import React, {Component} from 'react';
import PropTypes from 'prop-types';
 import FlatButton from 'material-ui/FlatButton';
 import TextField from 'material-ui/TextField';

import LinearProgress from 'material-ui/LinearProgress';

 import {green500, red500} from 'material-ui/styles/colors';

 import UserStore from '../../../stores/UserStore';
 import UserActions from '../../../actions/UserActions';

 const styles = {
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 0'
  }
 };

 class PasswordForm extends Component {

   constructor(props, context) {
     super(props, context);
    // Set default values
     this.state = {
       id: null,
       oldpassword: null,
       newPassword: null,
       repeatPassword: null,
       loading: false,
       onSubmit: props.onSubmit,
       onClose: props.onClose,
       error: {}, // error messages in form from WS
     };
   }

   handleCloseForm = () => {
     this.state.onClose();
   };

   handleSubmit = () => {
     this.state.onSubmit();
   };

   handleOldPasswordChange = (event) => {
     this.setState({
       oldPassword: event.target.value,
     });
   };

   handleNewPasswordChange = (event) => {
     this.setState({
       newPassword: event.target.value,
     });
   };

   handleRepeatNewPasswordChange = (event) => {
     this.setState({
       repeatPassword: event.target.value,
     });
   };

   save = (e) => {
     let component = this;
     if (this.state.newPassword !== this.state.repeatPassword) {
       component.setState({
         error: {
           'newPassword': 'Not the same as your second try',
           'repeatPassword': 'Not the same as your first try',
         },
         loading: false,
       });
     } else {

      component.setState({
        error: {},
        loading: true,
      });

      let user = {
        "old_password": this.state.oldPassword,
        "new_password1": this.state.newPassword,
        "new_password2": this.state.repeatPassword
      };

       UserStore.onceChangeListener((args) => {
         if (args) {
           if (args.id) {
             this.handleSubmit();
           } else {
             component.setState({
               error: args,
               loading: false,
             });
           }
         } else {
           this.handleSubmit();
         }
       });

       UserActions.changePassword(user);

     }

     if (e) {
       e.preventDefault();
     }
   };

   componentWillReceiveProps(nextProps) {
     this.setState({
       onSubmit: nextProps.onSubmit,
       onClose: nextProps.onClose,
       loading: false,
       error: {}, // error messages in form from WS
     });
   }

   render() {
     return (
      <div>
        {
          this.state.loading ?
          <LinearProgress mode="indeterminate" />
          : ''
        }
        <div style={{padding: '16px 28px 8px 28px', minWidth: '300px'}}>
          <form onSubmit={this.save}>
            <TextField
              floatingLabelText="Old password"
              type="password"
              onChange={this.handleOldPasswordChange}
              value={this.state.oldPassword}
              style={{width: '100%'}}
              errorText={this.state.error.oldPassword}
            /><br/>
            <TextField
              floatingLabelText="New password"
              type="password"
              onChange={this.handleNewPasswordChange}
              value={this.state.newPassword}
              style={{width: '100%'}}
              errorText={this.state.error.newPassword}
            /><br/>
            <TextField
              floatingLabelText="Please repeat new password"
              type="password"
              onChange={this.handleRepeatNewPasswordChange}
              value={this.state.repeatPassword}
              style={{width: '100%'}}
              errorText={this.state.error.repeatPassword}
            /><br/>
            <div style={styles.actions}>
              <FlatButton
                label="Cancel"
                onTouchTap={this.handleCloseForm}
              />
               <FlatButton
                label="Submit"
                primary={true}
                onTouchTap={this.save}
              />
            </div>
          </form>
        </div>
      </div>
     );
   }
}

 export default PasswordForm;