/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import { ROUTES } from '../constants/routes.js';
import '@testing-library/jest-dom';
import mockStore from '../__mocks__/store';
import store from '../__mocks__/store';
import BillsUI from '../views/BillsUI.js';

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
          store,
          localStorage: window.localStorage,
        });
        const blob = new Blob(['image'], { type: 'image/jpeg' });
        const file = new File([blob], 'file.jpeg', { type: 'image/jpeg' });
        const inputFile = screen.getByTestId('file');
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

        inputFile.addEventListener('change', handleChangeFile);
        fireEvent.change(inputFile, {
          target: {
            files: [file],
          },
        });

        expect(inputFile.files[0].name).toBe('file.jpeg');
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
        expect(inputFile.files[0].name).not.toBe('image.jpg');
      });
    });
  });
});

describe('Given I am connected as an employee', () => {
  describe('When I submit a new bill and return to Bill page', () => {
    test('Then fetches bills from mock Api Post', () => {
      const postSpy = jest.spyOn(store, 'bills');
      const bills = store.bills();

      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(bills.update.length).toBe(1);
    });
    test('Then fetches bills from an API and fails with 404 message error', () => {
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
    test('Then fetches messages from an API and fails with 500 message error', () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'));
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
