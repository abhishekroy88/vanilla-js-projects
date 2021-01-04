const screen = document.querySelector('.screen');
const numberKeys = document.querySelectorAll('.number');
const symbolKeys = document.querySelectorAll('.symbol')
const equalsKey = document.querySelector('.equals');
const clearKey = document.querySelector('.clear');

const calculatorOperators = ['*', '/', '+', '-'];
const calculatorNumbers = [...'1234567890.']; // Decimal point also included

resetScreen();
let resultEvaluated = false;

screen.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
        // Pressed key is the backscpace
        if (screen.value.length === 1 ||
            resultEvaluated) {
            
                e.preventDefault();
                resultEvaluated = false;
                resetScreen();
        }
    } else if (screen.value.length < screen.maxLength) {
            // Screen still has space
            e.preventDefault();
        
            if (calculatorNumbers.includes(e.key)) { 
                // Pressed Key is a number
                if (setsAreEqual(new Set([...screen.value]), new Set(['0']))) {
                    // Screen has zeros only
                    if (e.key !== '0') {
                        // Pressed key is non-zero value (including decimal point)
                        if (e.key === '.') {
                            // Pressed key is the decimal point
                            screen.value += e.key;
                        } else {
                            // Pressed key is a non-zero number
                            screen.value = e.key;
                        }
                    }
                } else {
                    // Screen has non-zero values
                    if (e.key === '.') {
                        // Pressed key is the decimal point
                        if (screen.value.slice(-1) !== '.') {
                            // Last char on the screen is not a decimal point
                            let lastIndexOfPressedKey = screen.value.lastIndexOf(e.key);
                            let canBeInserted = false;
                            
                            if (lastIndexOfPressedKey === -1) {
                                // There is no decimal point on screen currently
                                canBeInserted = true;
                            } else {
                                for (let operator of calculatorOperators) {
                                    let lastIndexOfOperator = screen.value.lastIndexOf(operator);
    
                                    if (lastIndexOfOperator > lastIndexOfPressedKey) {
                                        // There is at least one operator between this decimal and the previous one
                                        canBeInserted = true;
                                        break;
                                    }
                                }
                            }

                            if (canBeInserted) {
                                // Decimal point can be safely inserted
                                screen.value += e.key;
                            }
                        }
                    } else {
                        // Pressed key is a number (including zero)
                        if (resultEvaluated) {
                            resultEvaluated = false;
                            screen.value = e.key;
                        } else { 
                            let last2Chars = getLastNChars(screen.value, 2);

                            if (e.key === '0') {
                                // Pressed key is a zero
                                if (!calculatorOperators.includes(last2Chars[0]) ||
                                    last2Chars[1] !== '0') {
                                    // Either the second last character is not an operator
                                    // or the last character is not zero
                                    screen.value += e.key;
                                }
                                
                            } else {
                                // Pressed key is a non-zero number
                                if (calculatorOperators.includes(last2Chars[0]) &&
                                    last2Chars[1] === '0') {
                                    // The second last character on screen is an operator
                                    // AND the last number is a zero
                                    screen.value = screen.value.slice(0, -1) + e.key;
                                } else {
                                    screen.value += e.key;
                                }
                            }
                        }
                    }
                }
            } else if (calculatorOperators.includes(e.key)) {
                // Pressed key is an operator
                if (!operatorPresentAtEnd(screen.value)) {
                    // There is no operator at the end on the screen
                    if (screen.value !== '') {
                        // Screen is not empty
                        screen.value += e.key;
                        
                        if (resultEvaluated) {
                            resultEvaluated = false;
                        }
                    }
                } else {
                    // There is at least one operator at the end
                    let last2chars = getLastNChars(screen.value, 2);

                    if (last2chars[1] === '*' &&
                        last2chars[0] !== '*') {
                            // The last character on screen is an asterisk
                            // AND the second last one is not
                            // Allow another asterisk (needed to calculate exponents)
                            screen.value += e.key;
                    }
                }
            } else if (e.key === '=' || e.key === 'Enter') {
                // Pressed key is '=' or 'Enter'
                equalsKey.click();
            }
    }
});

// screen.addEventListener('keyup', () => {
//     keyIsDown = false;
// });


numberKeys.forEach(numberKey => {
    numberKey.addEventListener('click', () => {
        if (resultEvaluated) {
            screen.value = '';
            resultEvaluated = false;
        }

        if (numberKey.textContent.length + 
            screen.value.length <= screen.maxLength) {
                if (screen.value !== '0' || numberKey.textContent === '.') {
                    screen.value += numberKey.textContent;
                } else if (numberKey.textContent !== '0' && numberKey.textContent != '00') {
                    screen.value = numberKey.textContent;
                }
        }
    });
});


symbolKeys.forEach(symbolKey => {
    symbolKey.addEventListener('click', () => {
        if (!operatorPresentAtEnd(screen.value)) {
            if (resultEvaluated) {
                resultEvaluated = false;
            }
            
            if (symbolKey.textContent.length + 
                screen.value.length <= screen.maxLength) {
                    screen.value += symbolKey.textContent;
            }
        }
    });
});


equalsKey.addEventListener('click', () => {
    let exprToEvaluate = screen.value;
    let success = true;
    let result = 0;

    if (exprToEvaluate != '0') {
        if (operatorPresentAtEnd(exprToEvaluate)) {
            exprToEvaluate = exprToEvaluate.slice(0, -1);
        }
        
        try {
            result = eval(exprToEvaluate);
        } catch(err) {
            success = false;
        } finally {
            resultEvaluated = true;
            screen.focus();
        }
        
        if (success) {
            let decimalPlacesInResult = result.toString().split('.')[1];
            decimalPlacesInResult = decimalPlacesInResult ? 
                                        (decimalPlacesInResult.length > 5 ? 
                                        5 : decimalPlacesInResult.length) 
                                    : 0;
            
            screen.value = result.toFixed(decimalPlacesInResult);
        } else {
            screen.value = 'Error';
        }
    }
});


clearKey.addEventListener('click', () => {
    resetScreen();
});


function resetScreen() {
    screen.value = 0;
    screen.focus();
}


function operatorPresentAtEnd(expr) {
    return [...'+-*/'].includes(expr[expr.length - 1])
}


function alphabetPresentAtEnd(expr) {
    return expr.slice(-1).match(/[A-Za-z]+/) !== null;
}

function getLastNChars(expr, n) {
    return expr.slice(-n);
}

function setsAreEqual(set1, set2) {
    if (set1.size !== set2.size) return false;

    for (let item of set1) {
        if (!set2.has(item)) return false;
    }

    return true;
}
