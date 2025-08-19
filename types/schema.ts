import * as Yup from 'yup';

export const signInSchema = Yup.object().shape({
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
});
