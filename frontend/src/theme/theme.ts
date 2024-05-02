import { Theme, responsiveFontSizes } from '@mui/material';
import { createTheme, ComponentsOverrides } from '@mui/material/styles';
import { light, dark } from './palette';

const getTheme = (mode: string): Theme =>
  responsiveFontSizes(
    createTheme({
      palette: mode === 'light' ? light : dark,
    typography: {
      fontFamily: '"Söhne", sans-serif', // Ensuring the fontFamily is set correctly
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 400,
            letterSpacing: '0.0362px',
            borderRadius: 0,
            paddingTop: 10,
            paddingBottom: 10,
            textTransform: 'none',           },
          } as ComponentsOverrides['MuiButton'],
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              borderRadius: 0,
            },
          } as ComponentsOverrides['MuiInputBase'],
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 0,
            },
            input: {
              borderRadius: 0,
            },
          } as ComponentsOverrides['MuiOutlinedInput'],
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 0,
            },
          } as ComponentsOverrides['MuiCard'],
        },
      },
    })
  );

export default getTheme;
