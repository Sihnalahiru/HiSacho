import os
import zipfile

def make_zip(source_dir, output_zip):
    exclude_dirs = {'node_modules', '.git', 'dist', 'dist-server', '.cache'}
    exclude_exts = {'.pyc'}

    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if any(file.endswith(ext) for ext in exclude_exts):
                    continue
                if file.endswith('.zip'):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, rel_path)

if __name__ == '__main__':
    out = 'public/ssw-agriculture-interview-app.zip'
    make_zip('.', out)
    print(f"Created ZIP: {out} ({os.path.getsize(out)} bytes)")
