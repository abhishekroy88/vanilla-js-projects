$(document).ready(function() {
    const main = $('main')
    const searchBox = $('#search-box')
    const searchResults = $('.search-results')

    const UNTRUSTED_CHARS = ['&', '<', '>', '"', "'", '/', '!']
    const API_ENDPOINT = 'https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch='
    const ARTICLE_PAGE_URL = 'https://en.wikipedia.org/?curid='

    const NO_RESULTS_ERROR = 'Nothing found. Did you commit a typo?'

    searchBox.on('change', searchWiki)

    function searchWiki () {
        const searchString = searchBox.val()

        const isHtmlDetected = UNTRUSTED_CHARS.filter(char => searchString.includes(char)).length > 0
        
        if (searchString) {
            if (isHtmlDetected) {
                console.log('XSS Detected');
                return
            }

            const url = API_ENDPOINT + searchString
            
            $.ajax({
                url: url,
                method: 'GET',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                dataType: 'jsonp',
                data: '',
                success: function (data) {
                    if (data.query) {
                        displaySearchResults(data.query.pages)
                    } else {
                        emptyResults()
                        displayError(NO_RESULTS_ERROR)
                    }
                }
            })
        } else {
            emptyResults()
        }
    }

    function displaySearchResults (resultsObj) {
        emptyResults()

        for (const obj of Object.values(resultsObj)) {
            const resultDiv = $('<div>', {
                id: obj.pageid, 
                class: 'search-result-single',
                title: `Link to Wiki article - ${obj.title}`
            })
            const resultTitle = $('<h3>')
            const resultContent = $('<p>')

            resultTitle.text(obj.title)
            resultContent.text(obj.extract)

            resultDiv.append(resultTitle, resultContent)

            resultDiv.on('click', () => {
                window.open(ARTICLE_PAGE_URL + obj.pageid, '_blank', '', true)  
            })

            main.removeClass('flex-center')
            main.addClass('flex-top')

            searchResults.append(resultDiv)
        }
    }

    function emptyResults () {
        searchResults.empty()

        if (main.hasClass('flex-top')) {
            main.removeClass('flex-top')
            main.addClass('flex-center')
        }

        if (searchResults.hasClass('error')) {
            searchResults.removeClass('error')
        }
    }

    function displayError (msg) {
        if (!searchResults.hasClass('error')) {
            searchResults.addClass('error')
        }

        searchResults.text(msg)
    }
})
