/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import '@testing-library/jest-dom';
import mockStore from '../__mocks__/store';
import Router from '../app/Router.js';
import store from '../__mocks__/store';
import BillsUI from '../views/BillsUI.js';
import userEvent from '@testing-library/user-event';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('The form is displayed and then submitted', async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const newForm = screen.getByTestId('form-new-bill');
      expect(newForm).toBeTruthy();

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      newForm.addEventListener('submit', handleSubmit);
      fireEvent.submit(newForm);
      expect(handleSubmit).toBeCalled();
    });
    // describe('When I select the file', () => {
    //   test('And the file is wrong, then function handleChangeFile should be called and the file is not upload', async () => {
    //     const onNavigate = (pathname) => {
    //       document.body.innerHTML = ROUTES({ pathname });
    //       Object.defineProperty(window, 'localStorage', {
    //         value: localStorageMock,
    //       });
    //       window.localStorage.setItem(
    //         'user',
    //         JSON.stringify({ type: 'Employee' })
    //       );
    //       // const store = null;
    //       const NewBill = new NewBill({
    //         document,
    //         onNavigate,
    //         store: null,
    //         localStorage: window.localStorage,
    //       });
    //       const text = new Text(['text'], { type: 'image/txt' });
    //       const file = new File([text], 'file.txt', { type: 'image/txt' });
    //       const inputFile = screen.getByTestId('file');
    //       const handleChangeFile = jest.fn((e) => NewBill.handleChangeFile(e));
    //       inputFile.addEventListener('change', handleChangeFile);
    //       fireEvent.change(inputFile, {
    //         target: {
    //           files: [file],
    //         },
    //       });
    //       expect(handleChangeFile).toHaveBeenCalled();
    //       expect(NewBill.type).toBe('unknown');
    //     };
    //   });
    //   test('Then a file is a jpeg', async () => {

    describe('When I click on button change file', () => {
      beforeEach(() => {
        const html = NewBillUI();
        document.body.innerHTML = html;
      });

      test('Then a file is a jpeg', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const inputFile = screen.getByTestId('file');

        inputFile.addEventListener('change', handleChangeFile);
        fireEvent.change(inputFile, {
          target: {
            files: [
              new File(['image.jpg'], 'image.jpg', { type: 'image/jpg' }),
            ],
          },
        });

        expect(inputFile.files[0].name).toBe('image.jpg');
        expect(handleChangeFile).toBeCalled();
      });

      test('Then a file has a wrong type', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const inputFile = screen.getByTestId('file');

        inputFile.addEventListener('change', handleChangeFile);
        fireEvent.change(inputFile, {
          target: {
            files: [
              new File(['image.txt'], 'image.txt', { type: 'image/txt' }),
            ],
          },
        });
        expect(inputFile.files[0].name).toBe('image.txt');
      });
    });
  });
});

describe('Given I am a user connected as an Employee', () => {
  describe('When I submit a new bill and return to Bill page', () => {
    test('fetches bills from mock Api Post', () => {
      const postSpy = jest.spyOn(store, 'bills');
      const bills = store.bills();
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(bills.update.length).toBe(1);
    });
    test('fetches bills from an API and fails with 404 message error', () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });
      const html = BillsUI({ error: 'Erreur 404' });
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test('fetches messages from an API and fails with 500 message error', () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });
      const html = BillsUI({ error: 'Erreur 500' });
      document.body.innerHTML = html;
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
