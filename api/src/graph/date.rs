use super::prelude::*;

use chrono::NaiveDate;

#[derive(Debug, Clone, From, Into, Deref)]
pub struct DateScalar(Date);

impl Serialize for DateScalar {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let date: NaiveDate = self.0.into();
        date.serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for DateScalar {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let date = NaiveDate::deserialize(deserializer)?;
        let date: Date = date.into();
        let date: DateScalar = date.into();
        Ok(date)
    }
}

scalar!(
    DateScalar,
    "Date",
    "ISO 8601 calendar date without time zone."
);

#[derive(Debug, Clone, From, Into, Deref)]
pub struct DateTimeScalar(DateTime);

impl Serialize for DateTimeScalar {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.0.serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for DateTimeScalar {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let date_time = DateTime::deserialize(deserializer)?;
        Ok(date_time.into())
    }
}

scalar!(
    DateTimeScalar,
    "DateTime",
    "ISO 8601 combined date and time with time zone."
);
