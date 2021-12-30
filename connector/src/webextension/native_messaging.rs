use std::{
    error::Error,
    io::{Read, Write},
};

use byteorder::{NativeEndian, ReadBytesExt, WriteBytesExt};
use serde::{de::DeserializeOwned, Serialize};

pub fn write_output<T: Serialize, W: Write>(
    mut output: W,
    value: &T,
) -> Result<(), Box<dyn Error>> {
    let msg = serde_json::to_string(value)?;
    let size: u32 = msg.len().try_into()?;
    if size > 1024 * 1024 {
        return Err(format!("Message was too large, length: {}", size).into());
    }
    // output.write_all(&size.to_ne_bytes())?;
    output.write_u32::<NativeEndian>(size)?;
    output.write_all(msg.as_bytes())?;
    // println!("{:?}", size);
    output.flush()?;

    Ok(())
}

pub fn read_input<T: DeserializeOwned + Serialize, R: Read>(
    mut input: R,
) -> Result<T, Box<dyn Error>> {
    let size: usize = input.read_u32::<NativeEndian>()?.try_into()?;
    let mut buffer = vec![0; size];
    input.read_exact(&mut buffer)?;

    match serde_json::from_slice(&buffer) {
        Ok(v) => Ok(v),
        Err(e) => Err(Box::new(e)),
    }
}
