use std::io::{self, Read, Write};

use byteorder::{NativeEndian, ReadBytesExt, WriteBytesExt};
use serde::{de::DeserializeOwned, Serialize};

pub fn write_output<T: Serialize, W: Write>(mut output: W, value: &T) -> io::Result<()> {
    let msg = serde_json::to_string(value)?;
    let max_size: u32 = 1024 * 1024;
    let size: u32 = msg.len().try_into().unwrap_or(max_size + 1);
    if size > max_size {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "Given data exceeds max size!",
        ));
    }
    // output.write_all(&size.to_ne_bytes())?;
    output.write_u32::<NativeEndian>(size)?;
    output.write_all(msg.as_bytes())?;
    // println!("{:?}", size);
    output.flush()?;

    Ok(())
}

pub fn read_input<T: DeserializeOwned + Serialize, R: Read>(mut input: R) -> io::Result<T> {
    match input.read_u32::<NativeEndian>()?.try_into() {
        Ok(size) => {
            let mut buffer = vec![0; size];
            input.read_exact(&mut buffer)?;

            match serde_json::from_slice(&buffer) {
                Ok(v) => Ok(v),
                Err(e) => Err(e.into()),
            }
        }
        Err(err) => Err(io::Error::new(io::ErrorKind::InvalidInput, err)),
    }
}
