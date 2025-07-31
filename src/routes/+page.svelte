<!-- src/routes/+page.svelte -->
<script>
    /** @type {string | null} */
    let gameId; // This will hold the ID of the created game room.
    let isLoading = false; // Used to give feedback while the server is thinking.
    let copyButtonText = 'Copy Link'; // Text for the copy button.

    // This function will be called when the "Start New Game" button is clicked.
    async function createGame() {
        isLoading = true;
        copyButtonText = 'Copy Link'; // Reset button text

        // Make a POST request to our API endpoint.
        const response = await fetch('/api/create-game', {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            gameId = data.gameId; // Update our variable with the ID from the server.
        } else {
            alert('Error creating game. Please try again.');
        }

        isLoading = false;
    }

    // Task: Provide an easy way for the host to copy the link/code.
    function copyLink() {
        // Construct the full, shareable URL.
        const shareableLink = `${window.location.origin}/game/${gameId}`;
        
        // Use the browser's Clipboard API to copy the text.
        navigator.clipboard.writeText(shareableLink);

        // Provide visual feedback to the user.
        copyButtonText = 'Copied!';
        setTimeout(() => {
            copyButtonText = 'Copy Link';
        }, 2000); // Reset after 2 seconds
    }
</script>

<main>
    <h1>Welcome to Avalon</h1>
    <p>Create a game room and invite your friends to play.</p>

    <!-- Task: Create a "Start New Game" button on the main page. -->
    {#if !gameId}
        <button on:click={createGame} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Start New Game'}
        </button>
    {/if}

    <!-- This section will appear AFTER a game room has been created. -->
    {#if gameId}
        <div class="game-link-container">
            <h2>Your Game Room is Ready!</h2>
            <p>Share this link with your friends:</p>
            <div class="link-box">
                <input type="text" value="{window.location.origin}/game/{gameId}" readonly />
                <button on:click={copyLink}>{copyButtonText}</button>
            </div>
        </div>
    {/if}
</main>

<style>
    main {
        text-align: center;
        padding: 2rem;
        font-family: sans-serif;
    }

    button {
        font-size: 1.2rem;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        border: none;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover {
        background-color: #0056b3;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .game-link-container {
        margin-top: 2rem;
        padding: 2rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
    }

    .link-box {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
    }

    .link-box input {
        font-size: 1rem;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 300px;
        background-color: #fff;
    }
</style>