const payloadStage = 'payload'
const loadingStage = 'loading'
const resultStage = 'result'
const errorStage = 'error'
let activeStage = payloadStage

function getStage(stage) {
    return document.querySelector(`[data-stage="${stage}"]`)
}

function toggleStage(stage) {
    const current = getStage(activeStage)
    const target = getStage(stage)
    activeStage = stage

    console.log(`Switching from ${activeStage} to ${stage}`);
    current.style.opacity = '0'
    setTimeout(() => {
        current.style.display = 'none'
        target.style.display = ''
        queueMicrotask(() => {
            target.style.opacity = '1'
        })
    }, 300)
}

function callFactorization() {
    const payload = document.querySelector('#payload').value.trim();

    if (payload === '') {
        alert('Please enter a number.');
        return;
    }

    if (isNaN(payload)) {
        alert('Please enter a valid number.');
        return;
    }

    if (!Number.isInteger(parseFloat(payload))) {
        alert('Please enter an integer number.');
        return;
    }

    if (parseInt(payload) <= 1) {
        alert('Please enter a number greater than 1.');
        return;
    }

    console.log(`Number ${payload} sent for factorization`);

    toggleStage(loadingStage);

    const startTime = performance.now();

    fetch(`/factorize/${payload}`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        const endTime = performance.now();
        const timeTaken = (endTime - startTime).toFixed(2);
        console.log(`Number ${payload} factorized in ${timeTaken} ms`);
        showResult(payload, data.factors, timeTaken);
    })
    .catch(error => {
        showError(error, payload);
    });
}

function showResult(request, result, time) {
    toggleStage(resultStage)
    const container = getStage(resultStage)
    container.querySelector('#result-title').innerText = 'Number: ' + request;
    result.sort((a, b) => a - b);
    const factorsString = result.join(' * ');
    container.querySelector('#result').innerText = 'Factors: ' + factorsString;
    container.querySelector('#result-time').innerText = 'time: ' + time + ' ms';
    console.log(`Result for number ${request} displayed`);
}

function showError(errorMessage, number) {
    console.error(`Error occurred for number: ${number}. Message: ${errorMessage}`);
    toggleStage(errorStage);

    const container = getStage(errorStage);

    container.querySelector('#error').innerText = '';

    container.querySelector('#error').innerText = `Error occurred for number: ${number}. Message: ${errorMessage}`;
    console.log(`Error displayed for number ${number}: ${errorMessage}`);
}

function resetApp() {
    toggleStage(payloadStage);
    document.querySelector('#payload').value = '';
    console.log(`App reset`);
}

function showHistory() {
    toggleStage(loadingStage);
    fetch('/history')
        .then(response => response.json())
        .then(data => {
            toggleStage(resultStage);
            const container = getStage(resultStage);
            container.innerHTML = '';

            const history = data.history;
            if (history.length === 0) {
                container.innerText = 'История факторизации пуста.';
            } else {
                const table = document.createElement('table');
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Number</th>
                            <th>Factors</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                `;
                const tbody = table.querySelector('tbody');
                history.forEach(entry => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${entry.number}</td>
                        <td>${entry.factors}</td>
                        <td>${entry.date}</td>
                    `;
                    tbody.appendChild(row);
                });
                container.appendChild(table);
                const resetBtn = document.createElement('button');
                resetBtn.textContent = 'Reset';
                resetBtn.onclick = resetApp;
                container.appendChild(resetBtn);
            }
        })
        .catch(error => {
            toggleStage(errorStage);
            const container = getStage(errorStage);
            container.querySelector('#error').innerText = error;
        });
}

window.addEventListener('load', () => {
    document.querySelectorAll('.content').forEach(content => {
        if (content.dataset.stage !== activeStage) {
            content.style.display = 'none'
            content.style.opacity = '0'
        }
    })
})

function openHelp() {
    document.getElementById('helpModal').style.display = 'block';
    console.log(`Help modal opened`);
}

function closeHelp() {
    document.getElementById('helpModal').style.display = 'none';
    console.log(`Help modal closed`);
}

window.onclick = function(event) {
    var modal = document.getElementById('helpModal');
    if (event.target == modal) {
        modal.style.display = "none";
        console.log(`Clicked outside the help modal`);
    }
}
