interface FormError {
    param?: string | null;
    message: string;
}

interface FormErrorsProps {
    errors?: FormError[];
    param?: string;
}

export default function FormErrors({ errors = [], param }: FormErrorsProps) {
    const filteredErrors = errors.filter(error => (param ? error.param === param : error.param == null));

    if (filteredErrors.length === 0) {
        return null;
    }

    return (
        <ul style={{ color: 'darkred' }}>
            {filteredErrors.map((e, i) => (
                <li key={i}>{e.message}</li>
            ))}
        </ul>
    );
}