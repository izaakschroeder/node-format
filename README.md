File-format reader/writer.

== Notes ==
 * Terminating consectuative bit blocks that are not byte multiples may cause write problems (the write buffer is only flushed when the byte is full because at present it is unknown how many bit blocks remain)

== TODO ==
 * Dependency check (e.g. if iterate wants "count" and count is defined after, error)


Similar projects:
 * http://bigeasy.github.com/node-packet/
 * https://github.com/vjeux/jParser/
