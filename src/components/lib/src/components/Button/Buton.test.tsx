import * as React from 'react';
import { render, 
    // fireEvent, screen
 } from '@testing-library/react';
// import { Button } from './Button';

describe('Button', () => {
    test('render a default button with text', async () => {
        render(<button />);

        // expect(screen.getByText('Click Me')).toBeInTheDocument();
        // expect(screen.getByText('Click Me')).toHaveClass('storybook-button--secondary');
    });

    // test('renders a primary button', async () => {
    //     render(<Button primary label='Click Me'></Button>);

    //     expect(screen.getByText('Click Me')).toHaveClass('storybook-button--primary');
    // });

    // test('renders a button with custom colors', async () => {
    //     render(<Button label='Click Me' backgroundColor="#A78BFA" color="#1E40AF" />);

    //     expect(screen.getByText('Click Me')).toHaveStyle({
    //         backgroundColor: '#A78BFA',
    //         color: '#1E40AF',
    //     });
    // });

    // test('handles onClick', async () => {
    //     const mockOnClick = jest.fn();
    //     render(<Button label='Click me' onClick={mockOnClick}/>);
    //     fireEvent.click(screen.getByText('Click me'));
    
    //     expect(mockOnClick).toHaveBeenCalledTimes(1);
    // });
});
