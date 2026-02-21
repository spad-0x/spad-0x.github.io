#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <ctype.h>
#include <unistd.h>  // for read()


// Copying a String Safely
void func1(char *src) {

    // lenght validation
    size_t src_len = strlen(src);
    if (src_len > 1023) {
        fprintf(stderr, "Error: input too large\n");
        return;
    }
    char dst[1024];  // fixed maximum buffer size to prevent overflow
    strncpy(dst, src, src_len);
    dst[src_len] = '\0';  // ensure null-termination
}

// Reading from a File Descriptor Safely
void func2(int fd) {
    char *buf;
    size_t len;
    if (read(fd, &len, sizeof(len)) != sizeof(len)) {
        fprintf(stderr, "Error reading length\n");
        return;
    }

    if (len > 1024) {
        fprintf(stderr, "Error: data length exceeds buffer limit\n");
        return;
    }

    buf = (char *)malloc(len + 1);  // allocate buffer with an extra byte for null-termination
    if (buf == NULL) {
        fprintf(stderr, "Error: memory allocation failed\n");
        return;
    }

    if (read(fd, buf, len) != (ssize_t)len) {
        fprintf(stderr, "Error reading data\n");
        free(buf);
        return;
    }
    buf[len] = '\0';  // ensure null-termination

    free(buf);  // free allocated memory to avoid memory leaks
}

// Reading User Input with Bounds Checking
void func3() {
    char buffer[1024];
    printf("Please enter your user ID: ");
    if (fgets(buffer, sizeof(buffer), stdin) == NULL) {
        fprintf(stderr, "Error reading input\n");
        return;
    }

    if (!isalpha((unsigned char)buffer[0])) {
        char errormsg[1044];
        snprintf(errormsg, sizeof(errormsg), "%.1023s is not a valid ID", buffer);
        fprintf(stderr, "%s\n", errormsg);  // print error message securely
    }
}


// Buffer Allocation and Safe Copying
void func4(char *foo) {
    size_t foo_len = strlen(foo);
    if (foo_len >= 10) {
        fprintf(stderr, "Error: input too large for buffer\n");
        return;
    }
    char *buffer = (char *)malloc(10 * sizeof(char));
    if (buffer == NULL) {
        fprintf(stderr, "Error: memory allocation failed\n");
        return;
    }
    strncpy(buffer, foo, 9);  // safely copy up to 9 characters
    buffer[9] = '\0';         // null-terminate to ensure safety

    free(buffer);  // free allocated memory
}

int main() {
    int y = 10;
    int a[10];

    func4("fooooooooooooooooooooooooooooooooooooooooooooooooooo");

    // Simplified error handling for non-C++ code
    func3();

    FILE *aFile = fopen("output.txt", "w");  // declare and open a file securely
    if (aFile == NULL) {
        fprintf(stderr, "Error opening file\n");
        return 1;
    }

    fprintf(aFile, "%s\n", "hello world");  // use safe file handling functions
    fclose(aFile);  // close file after writing to it

    while (y > 0) {
        if (y < 10) {
            a[y] = y;  // safely use within bounds
        }
        y--;
    }

    return 0;
}
