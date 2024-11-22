CREATE OR REPLACE FUNCTION trigger()
RETURNS TRIGGER AS $$
DECLARE
    payload JSON;
    channel_name TEXT;
BEGIN
    channel_name := TG_ARGV[0];

    IF (TG_OP = 'INSERT') THEN
        payload = json_build_object('action', 'insert', 'data', row_to_json(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        payload = json_build_object('action', 'update', 'data', row_to_json(NEW));
    ELSIF (TG_OP = 'DELETE') THEN
        payload = json_build_object('action', 'delete', 'data', row_to_json(OLD));
    END IF;

    PERFORM pg_notify(channel_name, payload::text);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS sensor_insert_trigger ON sensor;
DROP TRIGGER IF EXISTS sensor_update_trigger ON sensor;
DROP TRIGGER IF EXISTS sensor_delete_trigger ON sensor;
DROP TRIGGER IF EXISTS measurements_insert_trigger ON meter;


CREATE TRIGGER sensor_insert_trigger
AFTER INSERT ON sensor
FOR EACH ROW
EXECUTE FUNCTION trigger('sensor_channel');


CREATE TRIGGER sensor_update_trigger
AFTER UPDATE ON sensor
FOR EACH ROW
EXECUTE FUNCTION trigger('sensor_channel');


CREATE TRIGGER sensor_delete_trigger
AFTER DELETE ON sensor
FOR EACH ROW
EXECUTE FUNCTION trigger('sensor_channel');


CREATE TRIGGER measurements_insert_trigger
AFTER INSERT ON meter
FOR EACH ROW
EXECUTE FUNCTION trigger('measurements_channel');
