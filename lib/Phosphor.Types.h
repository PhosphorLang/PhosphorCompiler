#pragma once

/** 1 Byte signed integer */
typedef signed char Integer8;
/** 2 Byte signed integer */
typedef signed short Integer16;
/** 4 Byte signed integer */
typedef signed long Integer32;
/** 8 Byte signed integer */
typedef signed long long Integer64;

/** 1 Byte unsigned integer */
typedef unsigned char Cardinal8;
/** 2 Byte unsigned integer */
typedef unsigned short Cardinal16;
/** 4 Byte unsigned integer */
typedef unsigned long Cardinal32;
/** 8 Byte unsigned integer */
typedef unsigned long long Cardinal64;

#if defined(__x86_64__) || defined(__x86_64) || defined(__LP64__) || defined(_LP64)

    /** Architecture (word size) dependent signed integer */
    typedef Integer64 Integer;
    /** Architecture (word size) dependent unsigned integer */
    typedef Cardinal64 Cardinal;

#else

    #error "Architecture is not supported."

#endif

/** A string value contains the size of the data as a cardinal and the data itself as an array. */
typedef struct
{
    const Cardinal size;
    const Cardinal8 data[];
} __attribute__((__packed__)) StringValue;

/**
 * The pointer to a string value.
 * A string value contains the size of the data as a cardinal and the data itself as an array.
 */
typedef const StringValue* String;
