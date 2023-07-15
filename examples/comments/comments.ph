module Comments;

import Standard.Io;

// Global comment

/**
 * Documentation comment
 */
function main /* Inline block comment */ () // Inline comment after function declaration
{
    // Statement level comment

    Io.writeLine ('This source code includes comments.'); // Inline comment after statement

    /*
        Block comment
    */
}

